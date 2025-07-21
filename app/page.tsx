"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CountryFromAPI {
  name: {
    common: string;
  };
  flags?: {
    png?: string;
  };
  currencies?: {
    [key: string]: unknown;
  };
}
interface Country {
  name: string;
  flag: string;
  code: string;
}

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  // for the first country
  const [countryName, setCountryName] = useState("");
  const [flag, setFlag] = useState("");
  const [countryCode, setCountryCode] = useState("");

  //for the second country
  const [toCountryName, setToCountryName] = useState("");
  const [toFlag, setToFlag] = useState("");
  const [toCode, setToCode] = useState("");

  //for exchange rates
  const [fromAmount, setFromAmount] = useState<number>(1);
  const [toAmount, setToAmount] = useState<number | null>(null);
  const [lastChanged, setLastChanged] = useState<"from" | "to">("from");


  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies,flags"
        );
        const data = await res.json();

        const parsedCountries: Country[] = (data as CountryFromAPI[]).map(
          (country) => ({
            name: country.name.common,
            flag: country.flags?.png || "",
            code: country.currencies ? Object.keys(country.currencies)[0] : "",
          })
        );
        setCountries(parsedCountries);
        const india = parsedCountries.find((c) => c.name === "India");
        const usa = parsedCountries.find((c) => c.name === "United States");

        if (india) {
          setCountryName(india.name);
          setFlag(india.flag);
          setCountryCode(india.code);
        }

        if (usa) {
          setToCountryName(usa.name);
          setToFlag(usa.flag);
          setToCode(usa.code);
        }
        console.log(flag);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCountries();
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "from" | "to"
  ) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.code === selectedCode);
    if (selectedCountry) {
      if (type === "from") {
        setCountryName(selectedCountry.name);
        setCountryCode(selectedCountry.code);
        setFlag(selectedCountry.flag);
      } else if (type === "to") {
        setToCountryName(selectedCountry.name);
        setToCode(selectedCountry.code);
        setToFlag(selectedCountry.flag);
      }
    }
  };
  useEffect(() => {
    if (
      !countryCode ||
      !toCode ||
      fromAmount === null ||
      countryCode === toCode
    )
      return;
    const fetchExchangeRate = async () => {
      try {
        let res;
        if (lastChanged === "from") {
          res = await fetch(
            `https://api.frankfurter.app/latest?amount=${fromAmount}&from=${countryCode}&to=${toCode}`
          );
        } else {
          res = await fetch(
            `https://api.frankfurter.app/latest?amount=${toAmount}&from=${toCode}&to=${countryCode}`
          );
        }
        const data = await res.json();
        const rate =
          data.rates?.[lastChanged === "from" ? toCode : countryCode];

        if (rate === undefined) {
          console.warn("No rate returned for", { data, countryCode, toCode });
          return;
        }

        if (lastChanged === "from") {
          setToAmount(rate);
        } else {
          setFromAmount(rate);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchExchangeRate();
  }, [fromAmount, toAmount, countryCode, toCode, lastChanged]);
  if (countries.length === 0) {
    return <div className="text-white">Loading countries...</div>;
  }
  return (
    <>
      <div className="w-screen min-h-screen bg-gradient-to-b from-orange-500 via-[#f3f4f6] to-green-600 flex flex-col justify-center items-center px-4 py-8">
        <h1 className="text-3xl font-bold italic text-blue-900 mb-2 text-center">
          SwiftFiX
        </h1>
        <p className="text-center text-yellow-900 mb-6 max-w-md text-sm sm:text-base">
          Here you can see the latest exchange rates of currencies of all the
          countries
        </p>

        <div className="bg-green-500 p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Convert your currency
          </h2>

          <div className="bg-white text-sm text-center rounded p-3 mb-4">
            {fromAmount} {countryCode} = <strong>{toAmount ?? "..."}</strong>{" "}
            {toCode}
          </div>

          <div className="flex flex-col gap-4">
            {/* first country */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white rounded p-3">
              {flag && (
                <Image
                  src={flag}
                  alt="flag"
                  width={40}
                  height={24}
                  className="rounded-sm"
                />
              )}
              <select
                className="p-2 border rounded flex-1 min-w-[100px]"
                onChange={(e) => handleChange(e, "from")}
                value={countryCode}
              >
                {countries.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="1"
                className="p-2 rounded border flex-1 min-w-[100px] focus:outline-none"
                value={fromAmount.toString()}
                onChange={(e) => {
                  setFromAmount(Number(e.target.value));
                  setLastChanged("from");
                }}
              />
            </div>

            {/* second country */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white rounded p-3">
              {toFlag && (
                <Image
                  src={toFlag}
                  alt="flag"
                  width={40}
                  height={24}
                  className="rounded-sm"
                />
              )}
              <select
                className="p-2 border rounded flex-1 min-w-[100px]"
                onChange={(e) => handleChange(e, "to")}
                value={toCode}
              >
                {countries.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="0.012"
                className="p-2 rounded border flex-1 min-w-[100px] focus:outline-none"
                value={toAmount ?? ""}
                onChange={(e) => {
                  setToAmount(Number(e.target.value));
                  setLastChanged("to");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
