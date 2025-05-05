import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon } from "lucide-react";

const Filter = () => {
  return (
    <div className="flex flex-row gap-4 p-6 pb-0 w-full">
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-full flex flex-row gap-6 justify-between">
        <div className="flex flex-col gap-2 items-center justify-center border-r border-r-muted-foreground/20 pr-4">
          <FilterIcon className="w-4 h-4" />
          <div className="text-sm font-medium">Filtros</div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Linha</div>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Linha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beloHorizonte">Belo Horizonte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Localização</div>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beloHorizonte">Belo Horizonte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Localização</div>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beloHorizonte">Belo Horizonte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Localização</div>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beloHorizonte">Belo Horizonte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Filter;


