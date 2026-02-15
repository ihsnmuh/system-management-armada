import Image from 'next/image'
import { TypographyH3 } from './Typography'

const Navbar = () => {
  return (
    <header className='sticky top-0 z-50 flex items-center gap-3 h-16 px-4 bg-primary border-b border-border'>
        <div className='relative h-10 w-10 shrink-0'>
          <Image src="/images/tj-putih.png" alt="logo" fill className='object-contain' />
        </div>
        <TypographyH3 className='text-primary-foreground truncate'>System Management Armada</TypographyH3>
    </header>
  )
}

export default Navbar