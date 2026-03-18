import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">New tenant application received</p>
          <p className="text-sm text-muted-foreground">Olivia Martinez applied for Apt 3B</p>
        </div>
        <div className="ml-auto font-medium text-xs text-muted-foreground">Just now</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>JW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Maintenance request completed</p>
          <p className="text-sm text-muted-foreground">Leaky faucet fixed at 123 Main St #2A</p>
        </div>
        <div className="ml-auto font-medium text-xs text-muted-foreground">2 hours ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>RJ</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Rent payment received</p>
          <p className="text-sm text-muted-foreground">Robert Johnson paid $1,450 for Apt 5C</p>
        </div>
        <div className="ml-auto font-medium text-xs text-muted-foreground">5 hours ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">New maintenance request</p>
          <p className="text-sm text-muted-foreground">Sarah Davis reported AC issues at 456 Oak St #4D</p>
        </div>
        <div className="ml-auto font-medium text-xs text-muted-foreground">Yesterday</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>TW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Lease renewal sent</p>
          <p className="text-sm text-muted-foreground">Lease renewal sent to Thomas Wilson for Apt 2C</p>
        </div>
        <div className="ml-auto font-medium text-xs text-muted-foreground">2 days ago</div>
      </div>
    </div>
  )
}
