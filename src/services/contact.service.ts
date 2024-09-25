import { supabase } from '../utils/supabase';
import { Contact } from '../models/contact.model';

interface IdentifyResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export async function identifyContact(email: string | null, phoneNumber: string | null): Promise<IdentifyResponse> {
  const { data: directContacts, error: directError } = await supabase
    .from('Contact')
    .select('*')
    .or(`email.eq.${email},phoneNumber.eq.${phoneNumber}`)
    .is('deletedAt', null);

  if (directError) throw new Error(`Error fetching direct contacts: ${directError.message}`);

  if (!directContacts || directContacts.length === 0) {
    const { data: newContact, error: insertError } = await supabase
      .from('Contact')
      .insert({ email, phoneNumber, linkPrecedence: 'primary' })
      .select()
      .single();

    if (insertError || !newContact) throw new Error(`Error creating new contact: ${insertError?.message}`);
    return formatResponse([newContact]);
  }

  const linkedIds = directContacts.map(c => c.linkedId).filter((id): id is number => id !== null);
  const primaryIds = directContacts.map(c => c.id);
  const allIds = [...new Set([...linkedIds, ...primaryIds])];

  const { data: allRelatedContacts, error: relatedError } = await supabase
    .from('Contact')
    .select('*')
    .or(`id.in.(${allIds.join(',')}),linkedId.in.(${allIds.join(',')})`)
    .is('deletedAt', null)
    .order('createdAt', { ascending: true });

  if (relatedError) throw new Error(`Error fetching related contacts: ${relatedError.message}`);

  let primaryContact = allRelatedContacts.find(c => c.linkPrecedence === 'primary' && c.linkedId === null);
  let secondaryContacts = allRelatedContacts.filter(c => c.id !== primaryContact?.id);

  if (!primaryContact) {
    primaryContact = allRelatedContacts[0];
    secondaryContacts = allRelatedContacts.slice(1);
  }

  const newInfoProvided = (email && !allRelatedContacts.some(c => c.email === email)) ||
                          (phoneNumber && !allRelatedContacts.some(c => c.phoneNumber === phoneNumber));

  if (newInfoProvided) {
    const { data: newSecondaryContact, error: insertError } = await supabase
      .from('Contact')
      .insert({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      })
      .select()
      .single();

    if (insertError || !newSecondaryContact) throw new Error(`Error creating secondary contact: ${insertError?.message}`);
    secondaryContacts.push(newSecondaryContact);
  }

  for (const contact of secondaryContacts) {
    if (contact.linkedId !== primaryContact.id) {
      const { error: updateError } = await supabase
        .from('Contact')
        .update({ linkedId: primaryContact.id, linkPrecedence: 'secondary' })
        .eq('id', contact.id);

      if (updateError) throw new Error(`Error updating contact ${contact.id}: ${updateError.message}`);
      contact.linkPrecedence = 'secondary';
      contact.linkedId = primaryContact.id;
    }
  }

  return formatResponse([primaryContact, ...secondaryContacts]);
}

function formatResponse(contacts: Contact[]): IdentifyResponse {
  const primaryContact = contacts.find(c => c.linkPrecedence === 'primary' && c.linkedId === null) || contacts[0];
  
  return {
    primaryContactId: primaryContact.id,
    emails: Array.from(new Set(contacts.map(c => c.email).filter((e): e is string => e !== null))),
    phoneNumbers: Array.from(new Set(contacts.map(c => c.phoneNumber).filter((p): p is string => p !== null))),
    secondaryContactIds: contacts.filter(c => c.id !== primaryContact.id).map(c => c.id)
  };
}