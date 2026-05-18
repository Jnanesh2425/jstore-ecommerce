const displayINRCurrency = (num) =>{
    const formatter = new Intl.NumberFormat('en-IN',{
        style : "currency",
        currency : "INR",
        minimumFractionDigits : 2
    })
    return formatter.format(num)
}

export default displayINRCurrency

//explaination

// Intl → Built-in JavaScript object for internationalization (number, date, currency formats).
// NumberFormat → A constructor inside Intl that creates a number formatter object.
// 'en-IN' → Locale code.
// 'en' = English language
// 'IN' = India region
// This makes it format numbers in Indian numbering system (lakhs, crores).
// options object → { style, currency, minimumFractionDigits }
// style: "currency" → tells formatter we want currency format, not plain number.
// currency: "INR" → ISO 4217 code for Indian Rupee → this is what makes the ₹ symbol appear.
// minimumFractionDigits: 2 → ensures always two digits after decimal (e.g., ₹1,000.00).
// formatter.format(num) → applies that formatting rules to your number.