import { AnimatedMenu } from "@/components/ui/animated-menu"

function AnimatedMenuDemo() {
  const menuItems = [
    {
      riveIcon: {
        src: "https://public.rive.app/community/runtime-files/2063-4080-phone-icon.riv",
        stateMachine: "phoneIconSM"
      },
      label: "Send Message",
      hotkey: "M",
      onClick: () => console.log("Send message clicked"),
    },
    {
      riveIcon: {
        src: "https://public.rive.app/community/runtime-files/2487-5077-robot-dance.riv",
        stateMachine: "State Machine 1"
      },
      label: "AI Assistant",
      hotkey: "A",
      onClick: () => console.log("AI Assistant clicked"),
    },
  ]

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100/50">
      <AnimatedMenu items={menuItems} />
    </div>
  )
}

export default AnimatedMenuDemo 