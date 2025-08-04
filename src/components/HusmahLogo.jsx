import Image from 'next/image'

export default function HusmahLogo({ className = "w-20 h-20 p-1" }) {
  return (
    <div className={`${className} relative`}>
      <Image 
        src="/logo.png" 
        alt="Husmah Engineering Logo" 
        width={60} 
        height={60}
        className="rounded-lg object-contain"
        priority
      />
    </div>
  )
}
