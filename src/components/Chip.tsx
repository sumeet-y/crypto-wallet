
interface ChipProps {
    chipsName: string;
    chipNo: number;
}

const Chip = ({chipsName, chipNo}:ChipProps) => {
    return (
        <div className="py-1 px-2 bg-white rounded-md flex gap-2 items-center">
            <p className="text-slate-700 text-xs font-light">{chipNo}</p>
            <p className="text-sm font-semibold text-slate-700">{chipsName}</p>
        </div>
    )
}

export default Chip;