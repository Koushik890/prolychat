export interface Contact {
  id: string
  avatar?: string  // Made optional to match most flexible definition
  instagramProfilePic?: string
  profilePictureUrl?: string
  username?: string
  name: string
  status: 'Subscribed' | 'Paused' | 'Report'
  subscribed: string
  pauseDuration?: string | null
  isPausedForever?: boolean
  pauseEndTime?: Date | null
}
