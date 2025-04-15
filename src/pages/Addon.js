// // src/pages/Brand.js

// import { useEffect, useState } from 'react';
// import HeadingText from '../components/HeadingText';
// import './Brand.css';
// import './Outlet.css';
// import './Staff.css';
// import './Tax.css';
// import './Categories.css';
// import GradientButton from '../components/GradientButton';
// import Button from '../components/Button';
// import SelectInput from '../components/SelectInput';
// import InputField from '../components/InputField';
// import Popup from '../components/Popup';
// import Checkbox from '../components/Checkbox';
// import SearchFilterBar from '../components/SearchFilterBar';
// import useFetchBrands from '../hooks/useFetchBrands';
// import useFetchOutlets from '../hooks/useFetchOutlets';
// import { toast } from 'react-toastify';
// import MultiSelect from './MultiSelect';
// import axios from 'axios';

// const weeks = [
//     { label: "Sunday", value: "sunday" },
//     { label: "Monday", value: "monday" },
//     { label: "Tuesday", value: "tuesday" },
//     { label: "Wednesday", value: "wednesday" },
//     { label: "Thursday", value: "thursday" },
//     { label: "Friday", value: "friday" },
//     { label: "Saturday", value: "saturday" },
// ];


// const Addon = () => {

//     const { brands } = useFetchBrands();
//     const { outlets } = useFetchOutlets();
//     const [addons, setAddons] = useState([]);
//     const [search, setSearch] = useState('');
//     const [status, setStatus] = useState('');

//     const [selectedBrand, setSelectedBrand] = useState(null);
//     const [selectedOutlet, setSelectedOutlet] = useState(null);
//     const [filteredOutlets, setFilteredOutlets] = useState([]);
//     const [applyOnAllOutlets, setApplyOnAllOutlets] = useState(false);
//     const [selectedDays, setSelectedDays] = useState([]);
//     const [name, setName] = useState("");
//     const [startTime, setStartTime] = useState("");
//     const [endTime, setEndTime] = useState('');
//     const [categoryStatus, setCategoryStatus] = useState(false);
//     const [categoryId, setCategoryId] = useState(null);

//     const [showPopup, setShowPopup] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);

//     useEffect(() => {
//         fetchAllAddons();
//     }, [])

//     const fetchAllAddons = async () => {
//         try {
//             const res = await axios.get("http://88.222.244.251:5001/api/addons/accessible", {
//                 withCredentials: true,
//             });
//             setAddons(res.data.addons || []);
//         } catch (err) {
//             toast.error(err?.response?.data?.message || "Failed to fetch payment types");
//         } finally {
//             // setLoading(false);
//         }
//     }

//     const handleAddNewCategory = () => {
//         setSelectedBrand(null);
//         setSelectedOutlet(null);
//         setCategoryId(null);
//         setName('');
//         setStartTime("");
//         setEndTime("");
//         setCategoryStatus(true);
//         setApplyOnAllOutlets(false);
//         setIsEditing(false);
//         setShowPopup(true);
//     }

//     const handleEditCategory = (cat) => {
//         setCategoryId(cat._id);
//         setName(cat.name);
//         setStartTime(cat.start_time);
//         setEndTime(cat.end_time);
//         setCategoryStatus(cat.status === "active" ? true : false);
//         setApplyOnAllOutlets(cat.apply_on_all_outlets);
//         handleBrandSelection(cat.brand_id);
//         const filteredDays = weeks.filter(day => cat.day.includes(day.value));
//         console.log(filteredDays);
//         handleDaySelection(filteredDays);
//         const selectedOutlet = outlets.find(outlet => outlet._id === cat.outlet_id?._id);
//         if (selectedOutlet) {
//             handleOutletSelection({
//                 label: selectedOutlet.name,
//                 value: selectedOutlet._id,
//             });
//         } else {
//             handleOutletSelection(null); // In case outlet not found
//         }
//         setIsEditing(true);
//         setShowPopup(true);
//     }


//     const handleSave = async () => {
//         if (!selectedBrand || !name || !(selectedDays.length > 0) || !startTime || !endTime || (!selectedOutlet && !applyOnAllOutlets)) {
//             toast.error("Please fill all required fields.");
//             return;
//         }

//         const payload = {
//             brand_id: selectedBrand._id,
//             outlet_id: applyOnAllOutlets ? undefined : selectedOutlet?.value,
//             name: name,
//             day: selectedDays.map(day => day.value),
//             start_time: startTime,
//             end_time: endTime,
//             status: categoryStatus ? "active" : "inactive",
//             apply_on_all_outlets: applyOnAllOutlets,
//         };

//         try {
//             if (isEditing) {
//                 // Assuming you're keeping track of the selected tax to edit
//                 await axios.put(`http://88.222.244.251:5001/api/categories/update/${categoryId}`, payload, { withCredentials: true });
//                 toast.success("Category updated successfully");
//             } else {
//                 await axios.post("http://88.222.244.251:5001/api/categories/create", payload, { withCredentials: true });
//                 toast.success("Category added successfully!")
//             }
//             setShowPopup(false);
//             fetchAllAddons();
//         } catch (err) {
//             toast.error(err?.response?.data?.message || "Something went wrong");
//         }
//     };

//     const handleBrandSelection = (brand) => {
//         setSelectedBrand(brand);
//         const filtered = outlets.filter(outlet => outlet.brand_id === brand._id);
//         setSelectedOutlet(null);
//         setFilteredOutlets(filtered);
//         if (filtered.length === 0) {
//             toast.error("Selected brand has no outlets.");
//             setApplyOnAllOutlets(false);
//         }
//     };

//     const handleOutletSelection = (outlet) => {
//         setSelectedOutlet(outlet);
//     }

//     const handleDaySelection = (dayArray) => {
//         setSelectedDays(dayArray);
//     };




//     return (
//         <>
//             <HeadingText>Addons</HeadingText>
//             <SearchFilterBar
//                 placeholder="Search Brand, Outlet, Categories..."
//                 searchValue={search}
//                 onSearchChange={setSearch}
//                 statusValue={status}
//                 onStatusChange={setStatus}
//             />
//             <div className="add-new-staff-info">
//                 <GradientButton clickAction={handleAddNewCategory}>Add Addon</GradientButton>
//                 <div className="table-container">
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Sr No</th>
//                                 <th>Brand Name</th>
//                                 <th>Outlet Name</th>
//                                 <th>Menu Name</th>
//                                 <th>Category</th>
//                                 <th>Items</th>
//                                 <th>Price</th>
//                                 <th>Status</th>
//                                 <th>All Items</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 addons.map((item, index) => (
//                                     <tr key={index}>
//                                         <td>{index + 1}</td>
//                                         <td>{item.brand_id.short_name}</td>
//                                         <td>{item.outlet_id.name}</td>
//                                         <td>{item.menu_id.name}</td>
//                                         <td>{item.category_id.name}</td>
//                                         <td>{item.items && item.items.map(i=>(<span>{i.name}</span>))}</td>
//                                         <td>{item.price}</td>
//                                         <td><div className={`status ${item.status}`}>{item.status}</div></td>
//                                         <td>{item.all_items}</td>
//                                         <td>
//                                             <div className="tax-action-btns">
//                                                 <button onClick={() => handleEditCategory(item)}>
//                                                     <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                                         <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
//                                                     </svg>
//                                                 </button>
//                                                 <button>
//                                                     <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                                         <path d="M17.25 3.5H13.5V2.75C13.5 2.15326 13.2629 1.58097 12.841 1.15901C12.419 0.737053 11.8467 0.5 11.25 0.5H6.75C6.15326 0.5 5.58097 0.737053 5.15901 1.15901C4.73705 1.58097 4.5 2.15326 4.5 2.75V3.5H0.75C0.551088 3.5 0.360322 3.57902 0.21967 3.71967C0.0790178 3.86032 0 4.05109 0 4.25C0 4.44891 0.0790178 4.63968 0.21967 4.78033C0.360322 4.92098 0.551088 5 0.75 5H1.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H15C15.3978 20 15.7794 19.842 16.0607 19.5607C16.342 19.2794 16.5 18.8978 16.5 18.5V5H17.25C17.4489 5 17.6397 4.92098 17.7803 4.78033C17.921 4.63968 18 4.44891 18 4.25C18 4.05109 17.921 3.86032 17.7803 3.71967C17.6397 3.57902 17.4489 3.5 17.25 3.5ZM6 2.75C6 2.55109 6.07902 2.36032 6.21967 2.21967C6.36032 2.07902 6.55109 2 6.75 2H11.25C11.4489 2 11.6397 2.07902 11.7803 2.21967C11.921 2.36032 12 2.55109 12 2.75V3.5H6V2.75ZM15 18.5H3V5H15V18.5ZM7.5 8.75V14.75C7.5 14.9489 7.42098 15.1397 7.28033 15.2803C7.13968 15.421 6.94891 15.5 6.75 15.5C6.55109 15.5 6.36032 15.421 6.21967 15.2803C6.07902 15.1397 6 14.9489 6 14.75V8.75C6 8.55109 6.07902 8.36032 6.21967 8.21967C6.36032 8.07902 6.55109 8 6.75 8C6.94891 8 7.13968 8.07902 7.28033 8.21967C7.42098 8.36032 7.5 8.55109 7.5 8.75ZM12 8.75V14.75C12 14.9489 11.921 15.1397 11.7803 15.2803C11.6397 15.421 11.4489 15.5 11.25 15.5C11.0511 15.5 10.8603 15.421 10.7197 15.2803C10.579 15.1397 10.5 14.9489 10.5 14.75V8.75C10.5 8.55109 10.579 8.36032 10.7197 8.21967C10.8603 8.07902 11.0511 8 11.25 8C11.4489 8 11.6397 8.07902 11.7803 8.21967C11.921 8.36032 12 8.55109 12 8.75Z" fill="black" />
//                                                     </svg>
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             }
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             {
//                 showPopup &&
//                 <Popup
//                     title={`Addon`}
//                     closePopup={() => setShowPopup(false)}
//                 >
//                     <div className="inputs-container">
//                         <div className="inputs-row">
//                             <SelectInput
//                                 label="Select Brand"
//                                 selectedOption={selectedBrand}
//                                 onChange={handleBrandSelection}
//                                 options={brands}
//                             />
//                             <SelectInput
//                                 label="Outlet"
//                                 selectedOption={selectedOutlet}
//                                 onChange={(outlet) => handleOutletSelection(outlet)}
//                                 options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
//                             />
//                         </div>
//                         <div className="inputs-row">
//                             <SelectInput
//                                 label="Select Menu"
//                                 selectedOption={selectedMenu}
//                                 onChange={handleMenuSelection}
//                                 options={filteredMenus.map(o => ({ label: o.name, value: o._id }))}
//                             />
//                             <SelectInput
//                                 label="Select Category"
//                                 selectedOption={selectedCategory}
//                                 onChange={handleCategorySelection}
//                                 options={filteredCategories.map(o => ({ label: o.name, value: o._id }))}
//                             />
//                         </div>
//                         <div className="inputs-row">
//                             <MultiSelect
//                                 label={"Select Items"}
//                                 options={filteredItems}
//                                 selectedOptions={selectedItems}
//                                 onChange={(option) => handleItemsSelection(option)}
//                             />
//                             <InputField
//                                 label="Price"
//                                 type="text"
//                                 value={price}
//                                 onChange={(e) => setPrice(e.target.value)}
//                                 placeholder="Enter Price"
//                                 required
//                             />
//                         </div>
//                         <div className="checkbox-container">
//                             {
//                                 isEditing ?
//                                     <Checkbox
//                                         label="Status"
//                                         checked={categoryStatus}
//                                         onChange={() => setCategoryStatus(!categoryStatus)}
//                                     /> : null
//                             }
//                             <Checkbox
//                                 label="Apply On All Items"
//                                 checked={applyOnAllItems}
//                                 onChange={() => setApplyOnAllOutlets(!applyOnAllOutlets)}
//                             />
//                         </div>
//                     </div>

//                     <div className="action-btns-container">
//                         <GradientButton clickAction={handleSave}>
//                             {
//                                 isEditing ? "Update" : "Create"
//                             }
//                         </GradientButton>
//                         <Button clickAction={() => setShowPopup(false)}>Close</Button>
//                     </div>
//                 </Popup>
//             }
//         </>
//     )
// }

// export default Addon;
