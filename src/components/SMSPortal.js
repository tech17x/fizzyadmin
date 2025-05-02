import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import SelectInput from "./SelectInput"; // Custom select input
import GradientButton from "./GradientButton";
import Button from "./Button";
import Popup from "./Popup"; // Your reusable Popup component
import { toast } from "react-toastify";
import Loader from "./Loader";

const SMSPortal = ({ hideSMSModel, customer }) => {
    const API = process.env.REACT_APP_API_URL;
    const [credentials, setCredentials] = useState([]);
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [dynamicFields, setDynamicFields] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchWhatsAppCredentials = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/whatsapp/accessible`, {
                withCredentials: true,
            });
            setCredentials(response.data.credentials || []);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to fetch WhatsApp credentials"
            );
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchWhatsAppCredentials();
    }, [fetchWhatsAppCredentials])

    const fetchTemplates = async (accessToken, phoneNumberId, businessAccountId) => {
        try {
            if (!accessToken || !phoneNumberId || !businessAccountId) {
                toast.error('Please fill all fields!');
                setLoading(false);
                return;
            }

            const res = await axios.get(
                `https://graph.facebook.com/v17.0/${businessAccountId}/message_templates`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const fetchedTemplates = res.data.data;

            if (!fetchedTemplates || fetchedTemplates.length === 0) {
                toast.error('No templates found!');
                setLoading(false);
                return;
            }

            setTemplates(fetchedTemplates); // store them in state
            toast.success('Templates fetched successfully!');
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch templates!');
            setLoading(false);
        }
    };

    const handleTemplateSelection = (val) => {
        const template = templates.find((t) => t.id === val.value);
        setSelectedTemplate(template);

        const allText = template.components?.map(c => c.text).join(" ") || "";
        const matches = [...allText.matchAll(/{{(.*?)}}/g)];
        const defaultFields = {};
        matches.forEach((match) => {
            defaultFields[match[1]] = "";
        });
        setDynamicFields(defaultFields);
    };


    const handleInputChange = (field, value) => {
        setDynamicFields({ ...dynamicFields, [field]: value });
    };

    // const countryDialCodes = {
    //     US: '1',
    //     IN: '91',
    //     CA: '1',
    //     GB: '44',
    //     AU: '61',
    //     // Add more country codes as needed
    // };

    // const resetAll = () => {
    //     setSelectedCredential(null);
    //     setSelectedTemplate(null);
    //     setDynamicFields({});
    // };

    const sendMessage = async () => {
        try {
            const selectedCredentialObj = credentials.find(
                (cred) => cred._id === selectedCredential?.value
            );

            if (!selectedCredentialObj || !selectedTemplate || !customer?.phone) {
                toast.error("Please select credential, template, and ensure phone & country are available.");
                return;
            }

            const accessToken = selectedCredentialObj.accessToken;
            const phoneNumberId = selectedCredentialObj.phoneNumberId;

            if (!accessToken || typeof accessToken !== "string") {
                toast.error("Access token is missing or invalid.");
                return;
            }

            // Normalize phone number
            let rawPhone = customer.phone;
            let digitsOnly = rawPhone.replace(/\D/g, '');
            const countryCode = "91";
            if (!digitsOnly.startsWith(countryCode)) {
                digitsOnly = countryCode + digitsOnly;
            }
            const customerPhone = digitsOnly;

            // 🔍 Filter only changed (non-empty) dynamic fields
            const changedFields = Object.entries(dynamicFields).reduce((acc, [key, value]) => {
                if (value?.trim()) acc[key] = value;
                return acc;
            }, {});

            console.log("Changed Input Values →", changedFields);

            const components = [];

            selectedTemplate.components.forEach(component => {
                if (component.type === "BODY" && component.text) {
                    const matches = [...component.text.matchAll(/{{(.*?)}}/g)];
                    const parameters = [];

                    matches.forEach((match) => {
                        const variableKey = match[1]; // e.g., "1", "2"
                        const value = changedFields[variableKey];
                        if (value) {
                            parameters.push({ type: "text", text: value });
                        }
                    });

                    if (parameters.length > 0) {
                        components.push({
                            type: "body",
                            parameters
                        });
                    }
                }
            });

            const messagePayload = {
                messaging_product: "whatsapp",
                to: customerPhone,
                type: "template",
                template: {
                    name: selectedTemplate.name,
                    language: {
                        code: selectedTemplate.language || "en"
                    },
                    ...(components.length > 0 && { components })
                }
            };
            console.log(selectedTemplate)
            console.log("Message Payload →", JSON.stringify(messagePayload, null, 2));

            // Now send the message if needed
            await axios.post(
                `https://graph.facebook.com/v12.0/${phoneNumberId}/messages`,
                messagePayload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            toast.success("Message sent successfully!");
        } catch (error) {
            toast.error("Error sending message: " + error.message);
        }
    };








    const handleAPISelection = (val) => {
        setLoading(true);
        setSelectedCredential(val);
        const selectedCredential = credentials.find(cred => cred._id === val.value);
        fetchTemplates(selectedCredential.accessToken, selectedCredential.phoneNumberId, selectedCredential.businessAccountId);
    }

    const parseTemplateText = (text = "") => {
        const parts = text.split("{{");
        return parts.map((part, index) => {
            if (!part.includes("}}")) return part;
            const [fieldName, rest] = part.split("}}");
            return (
                <span key={index}>
                    <input
                        placeholder={fieldName}
                        value={dynamicFields[fieldName] || ""}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        style={{
                            padding: "4px 6px",
                            margin: "0 3px",
                            borderRadius: "4px",
                            border: "1px solid #bbb",
                            fontSize: "14px",
                            width: "120px"
                        }}
                    />
                    {rest}
                </span>
            );
        });
    };


    return (
        <>
            {
                loading && <Loader />
            }

            <Popup title="Send WhatsApp Message" closePopup={hideSMSModel}>
                <div className="inputs-container">
                    <div className="inputs-row">
                        <SelectInput
                            label="SMS API"
                            selectedOption={selectedCredential}
                            onChange={(val) => {
                                handleAPISelection(val);
                            }}
                            options={credentials.map((cred) => ({
                                label: cred.name,
                                value: cred._id,
                            }))}
                        />
                        <SelectInput
                            label="Choose Template"
                            selectedOption={selectedTemplate ? { label: selectedTemplate.name, value: selectedTemplate.id } : null}
                            onChange={(val) => {
                                handleTemplateSelection(val);
                            }}
                            options={templates.map((t) => ({
                                label: t.name,
                                value: t.id,
                            }))}
                        />
                    </div>
                </div>

                {/* CUSTOMER INFO */}
                {selectedTemplate && (
                    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                        {/* MESSAGE PREVIEW SECTION */}
                        <div style={{
                            flex: 2,
                            background: "#e5ddd5",
                            borderRadius: "8px",
                            padding: "20px",
                            fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
                            color: "#111",
                        }} id="infoHere">
                            <h4 style={{ marginBottom: "10px" }}>WhatsApp Message Preview</h4>
                            {/* HEADER */}
                            {selectedTemplate.components?.find(c => c.type === "HEADER") && (
                                <div style={{
                                    background: "#dcf8c6",
                                    padding: "10px 15px",
                                    borderRadius: "7.5px",
                                    marginBottom: "10px",
                                    alignSelf: "flex-end",
                                    maxWidth: "80%"
                                }}>
                                    {parseTemplateText(selectedTemplate.components.find(c => c.type === "HEADER")?.text)}
                                </div>
                            )}

                            {/* BODY */}
                            {selectedTemplate.components?.find(c => c.type === "BODY") && (
                                <div style={{
                                    background: "#dcf8c6",
                                    padding: "10px 15px",
                                    borderRadius: "7.5px",
                                    marginBottom: "10px",
                                    alignSelf: "flex-end",
                                    maxWidth: "80%"
                                }}>
                                    {parseTemplateText(selectedTemplate.components.find(c => c.type === "BODY")?.text)}
                                </div>
                            )}

                            {/* FOOTER */}
                            {selectedTemplate.components?.find(c => c.type === "FOOTER") && (
                                <div style={{
                                    fontSize: "12px",
                                    color: "#555",
                                    fontStyle: "italic"
                                }}>
                                    {selectedTemplate.components.find(c => c.type === "FOOTER")?.text}
                                </div>
                            )}
                        </div>

                        {/* CUSTOMER INFO PANEL */}
                        <div style={{
                            flex: 1,
                            background: "#f9f9f9",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "15px",
                            maxHeight: "300px",
                            overflowY: "auto"
                        }}>
                            <h4>Customer Info</h4>
                            {[
                                { label: "Name", value: customer?.brand_id?.full_name },
                                { label: "Email", value: customer?.outlet_id?.email },
                                { label: "Phone", value: customer?.outlet_id?.phone },
                                { label: "Street", value: customer?.address?.street },
                                { label: "City", value: customer?.address?.city },
                                { label: "State", value: customer?.address?.state },
                                { label: "Zip", value: customer?.address?.zip },
                                { label: "Country", value: customer?.address?.country }
                            ].map((field, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span><strong>{field.label}:</strong> {field.value}</span>
                                    <button
                                        style={{
                                            background: "#ccc",
                                            border: "none",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(field.value || "");
                                            toast.success(`${field.label} copied!`);
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="action-btns-container" style={{ marginTop: "20px" }}>
                    <GradientButton clickAction={sendMessage}>Send</GradientButton>
                    <Button clickAction={hideSMSModel}>Close</Button>
                </div>
            </Popup>

        </>
    );
};

export default SMSPortal;
