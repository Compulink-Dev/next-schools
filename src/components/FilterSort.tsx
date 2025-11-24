// Combined Filter and Sort Component
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, SortDesc, SlidersHorizontal } from "lucide-react";

const FilterSort = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 group"
        >
          <SlidersHorizontal
            size={16}
            className="text-amber-600 group-hover:scale-110 transition-transform duration-200"
          />
          <span className="text-amber-700 font-medium">Filters</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Filter size={14} />
          Filter Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            By Class
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            By Subject
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            By Status
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <SortDesc size={14} />
          Sort Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2">
            Name A-Z
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            Name Z-A
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            Oldest First
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterSort;
