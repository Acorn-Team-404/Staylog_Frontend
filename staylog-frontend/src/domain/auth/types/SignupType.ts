export interface signupStateType {
   loginId: string
   password: string
   password2: string
   nickname: string
   name: string
   email: string
   phone: string
   code: string
}

export interface signupValidType {
   loginId: boolean
   password: boolean
   password2: boolean
   nickname: boolean
   email: boolean
   name: boolean
   phone: boolean
}

export interface signupDirtyType {
   loginId: boolean
   password: boolean
   password2: boolean
   nickname: boolean
   name: boolean
   email: boolean
   phone: boolean
}

export interface signupConfirmType {
   loginId: boolean
   nickname: boolean
   email: boolean
}