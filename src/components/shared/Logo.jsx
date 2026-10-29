import logo from '../../assets/Turquoise Circular AM Monogram.png'

export default function Logo({ className = '' }) {
  return <img src={logo} alt="شعار AM" className={`h-10 w-10 object-contain ${className}`} />
}
