"use client";
import React, { useState } from "react";
import Image from "next/image";
import { debounce } from "lodash";

function GeoapifyAddressSearch({ onSelect, onInputChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = debounce(async (value) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onInputChange) onInputChange(value);

    if (value.length > 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (place) => {
    setSearchTerm(place.properties.formatted); // Set the selected address in input
    setSuggestions([]); // Clear suggestions after selection
    if (onSelect) {
      onSelect({
        address: place.properties.formatted,
        lat: place.properties.lat,
        lon: place.properties.lon,
        selected: true,
      });
    }
  };

  return (
    <div className=" relative flex flex-col gap-2 items-center w-full">
      <div className="w-full flex items-center rounded-l-lg px-2">
        <Image
          src={"/placeholder.png"}
          width={40}
          height={40}
          alt="Map Pin"
          priority
          className="rounded-l-lg"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter a location"
          className="w-full border border-gray-300 p-2 rounded"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="suggestion-list"
          aria-expanded={suggestions.length > 0}
        />
      </div>
      {suggestions.length > 0 && (
        <ul
          id="suggestion-list"
          role="listbox"
          className="w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded mt-1"
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.properties.place_id}
              role="option"
              tabIndex={0}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(suggestion)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect(suggestion);
              }}
            >
              {suggestion.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GeoapifyAddressSearch;
