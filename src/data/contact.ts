export interface ContactInfo {
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  phone: string
  email: string
}

export const contactInfo: ContactInfo = {
  address: {
    street: '24422 Starview Landing Ct',
    city: 'Spring',
    state: 'TX',
    zip: '77373'
  },
  phone: '(832) 762-5299',
  email: 'info@hybridtechauto.com'
}

