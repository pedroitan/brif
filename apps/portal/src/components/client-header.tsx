export type ClientHeaderProps = {
  agencyName: string;
  projectName: string;
  clientName: string;
  clientCompany: string;
  clientInitials: string;
};

export function ClientHeader({
  agencyName,
  projectName,
  clientName,
  clientCompany,
  clientInitials,
}: ClientHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-gray-900">{agencyName}</div>
        <div className="text-sm text-gray-600">
          Projeto: <span className="font-medium">{projectName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
          {clientInitials}
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">{clientName}</div>
          <div className="text-xs text-gray-500">{clientCompany}</div>
        </div>
      </div>
    </div>
  );
}
