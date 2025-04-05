import React, { useEffect, useState } from "react";
import SelectInput from "./SelectInput";
import GradientButton from "./GradientButton";
import Button from "./Button";
import useFetchBrands from "../hooks/useFetchBrands";
import useFetchOutlets from "../hooks/useFetchOutlets";

const BrandOutletFilter = ({ onFilterSubmit, onReset }) => {
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    useEffect(() => {
        setSelectedOutlet(null);
    }, [selectedBrand])

    return (
        <div className="brand-filter">
            <div className="two-col-row">
                <SelectInput
                    selectedOption={selectedBrand}
                    onChange={setSelectedBrand}
                    options={brands}
                    label="Brand Name"
                />
                <SelectInput
                    disable={!selectedBrand}
                    selectedOption={selectedOutlet}
                    onChange={setSelectedOutlet}
                    options={outlets.filter(outlet => outlet.brand_id === selectedBrand?._id)}
                    label="Outlet Name"
                />
            </div>
            <div className="filter-action-btns">
                <GradientButton clickAction={() => onFilterSubmit(selectedBrand, selectedOutlet)}>Submit</GradientButton>
                <Button clickAction={() => {
                    setSelectedBrand(null);
                    setSelectedOutlet(null);
                    onReset();
                }}>Reset</Button>
            </div>
        </div>
    );
};

export default BrandOutletFilter;
