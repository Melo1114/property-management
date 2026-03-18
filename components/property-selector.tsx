"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Home } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const properties = [
  {
    value: "all",
    label: "All Properties",
  },
  {
    value: "oakwood",
    label: "Oakwood Apartments",
  },
  {
    value: "riverside",
    label: "Riverside Condos",
  },
  {
    value: "sunset",
    label: "Sunset Villas",
  },
  {
    value: "meadow",
    label: "Meadow View Townhomes",
  },
  {
    value: "harbor",
    label: "Harbor Point Apartments",
  },
]

export function PropertySelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("all")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {properties.find((property) => property.value === value)?.label || "Select property..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search property..." />
          <CommandList>
            <CommandEmpty>No property found.</CommandEmpty>
            <CommandGroup>
              {properties.map((property) => (
                <CommandItem
                  key={property.value}
                  value={property.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === property.value ? "opacity-100" : "opacity-0")} />
                  {property.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
