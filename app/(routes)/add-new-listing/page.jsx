"use client";
import React, { useState } from "react";
import GeoapifyAddressSearch from "@/app/_components/GeoapifyAddressSearch";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader } from "lucide-react";

function AddNewListing() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [typedAddress, setTypedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Handle address selection from autocomplete
  const handleAddressSelect = (data) => {
    setSelectedLocation({ ...data, selected: true });
    console.log("Selected address:", data.address);
    console.log("Latitude:", data.lat);
    console.log("Longitude:", data.lon);
  };

  // Handle address typing (for fallback geocoding)
  const handleInputChange = (value) => {
    setTypedAddress(value);
    setSelectedLocation(null); // Reset if user types again
  };

  // Function to fetch coordinates if no suggestion selected
  const fetchCoordinatesFromAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        return {
          address: place.properties.formatted,
          lat: place.properties.lat,
          lon: place.properties.lon,
          selected: true,
        };
      }
      return null;
    } catch (error) {
      console.error("Geoapify fetch error:", error);
      return null;
    }
  };

  // Handle "Next" button logic
  const handleNextClick = async () => {
    setLoading(true);
    let finalLocation = selectedLocation;

    if (!selectedLocation && typedAddress) {
      finalLocation = await fetchCoordinatesFromAddress(typedAddress);
      setSelectedLocation(finalLocation);
    }

    if (finalLocation) {
      const { address, lat, lon } = finalLocation;

      // ✅ Insert into Supabase
      const { data, error } = await supabase
        .from("Listings")
        .insert([
          {
            Address: finalLocation.address,
            Coordinates: {
              lat: finalLocation.lat,
              lon: finalLocation.lon,
            },
            CreatedBy: user?.primaryEmailAddress.emailAddress,
          },
        ])
        .select();

      if (data) {
        setLoading(false);
        console.log("New Data Added,", data);
        toast("New Address added for Listing");
      }

      if (error) {
        setLoading(false);
        console.error("Error saving listing:", error);
        toast("Server side error");
      } else {
        console.log("Listing saved:", data);
        // Optional: Redirect or reset form
      }
    } else {
      alert("Please enter a valid address.");
    }
  };

  return (
    <div className="mt-10 md:mx-56 lg:mx-80">
      <div className="p-10 flex flex-col gap-5 items-center justify-center">
        <h2 className="font-bold text-2xl">Add New Listing</h2>
        <div className="p-5 rounded-lg border w-full shadow-md flex flex-col gap-5">
          <h2 className="text-gray-500">Enter the address you want to list.</h2>

          <GeoapifyAddressSearch
            onSelect={handleAddressSelect}
            onInputChange={handleInputChange}
          />

          {/* Display coordinates or error */}
          {selectedLocation && (
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Address:</strong> {selectedLocation.address}
              </p>
              <p>
                <strong>Latitude:</strong> {selectedLocation.lat}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedLocation.lon}
              </p>
              <p>
                <em>
                  Source:{" "}
                  {selectedLocation.selected ? "Autocomplete" : "Geocoded"}
                </em>
              </p>
            </div>
          )}

          <Button
            disabled={loading || !selectedLocation}
            onClick={handleNextClick}
          >
            {loading ? <Loader className="animate-spin"/> : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddNewListing;
