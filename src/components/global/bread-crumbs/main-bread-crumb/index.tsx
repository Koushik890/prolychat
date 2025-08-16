import { PAGE_ICON } from '@/constants/pages'
import React from 'react'

type Props = {
  page: string
  slug?: string
}

const MainBreadCrumb = ({ page, slug }: Props) => {
  const normalizedPage = page.toLowerCase()
  
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  if (normalizedPage === 'home' || normalizedPage === 'automations') {
    return (
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <h1 className="min-w-[55px] h-[40px] font-hubot text-[32px] font-semibold leading-[40px] tracking-tight text-start text-[#282d47] bg-clip-text">
            {capitalizeFirstLetter(page)}
          </h1>
        </div>
      </div>
    )
  }

  if (normalizedPage === 'settings' || normalizedPage === 'integrations') {
    return (
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <h2 className="min-w-[55px] h-[40px] font-hubot text-[32px] font-semibold leading-[40px] tracking-tight text-start text-[#282d47] bg-clip-text">
            {capitalizeFirstLetter(page)}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start">
      <span className="bg-gradient-to-br from-[#F3EAFD] to-[#FCE8F7] backdrop-blur-lg shadow-[0_2px_8px_rgba(162,136,247,0.1)] rounded-3xl border border-[#E5E5E5] inline-flex py-5 lg:py-10 px-8 items-center">
        <h2 className="min-w-[55px] h-[40px] font-hubot text-[32px] font-semibold leading-[40px] tracking-tight text-start text-[#282d47] bg-clip-text">
          {capitalizeFirstLetter(page)}
        </h2>
      </span>
    </div>
  )
}

export default MainBreadCrumb
