export interface BusinessHours {
  weekdays: {
    enabled: boolean
    open: string
    close: string
  }
  saturday: {
    enabled: boolean
    open: string
    close: string
  }
  sunday: {
    enabled: boolean
    open: string
    close: string
  }
}

export const businessHours: BusinessHours = {
  weekdays: {
    enabled: true,
    open: '8:00 AM',
    close: '6:00 PM'
  },
  saturday: {
    enabled: true,
    open: '8:00 AM',
    close: '3:00 PM'
  },
  sunday: {
    enabled: false,
    open: '9:00 AM',
    close: '1:00 PM'
  }
}

