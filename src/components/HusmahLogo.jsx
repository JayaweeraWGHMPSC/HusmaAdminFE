import Image from 'next/image'

export default function HusmahLogo({ className = "w-20 h-20" }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <Image 
        src="/logo.png" 
        alt="Husmah Engineering Logo" 
        width={48} 
        height={48}
        className="rounded-lg object-contain"
        priority
      />
    </div>
  )
}
