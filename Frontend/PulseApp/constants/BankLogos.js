export const BANK_LOGOS = {
    SBI: require('../assets/banks/Sbi.png'),
    HDFC: require('../assets/banks/hdfc.png'),
    AXIS: require('../assets/banks/Axis.png'),
    FEDERAL: require('../assets/banks/Federal.png'),
    ICICI: require('../assets/banks/Icici.png'),
    KOTAK: require('../assets/banks/Kotak.png'),
    PNB: require('../assets/banks/Pnb.png'),
    BOB: require('../assets/banks/Bob.png'),
    GOOGLEPAY: require('../assets/banks/GPay.png'),
    PHONEPE: require('../assets/banks/PhonePe.png'),
    PAYTM: require('../assets/banks/Paytm.png'),
};

export const getBankLogo = (bankName) => {
    if (!bankName) return null;
    const name = bankName.toUpperCase();

    // Map the database string to the BANK_LOGOS asset
    if (name.includes('HDFC')) return BANK_LOGOS.HDFC;
    if (name.includes('SBI') || name.includes('STATE BANK')) return BANK_LOGOS.SBI;
    if (name.includes('ICICI')) return BANK_LOGOS.ICICI;
    if (name.includes('AXIS')) return BANK_LOGOS.AXIS;
    if (name.includes('KOTAK')) return BANK_LOGOS.KOTAK;
    if (name.includes('FEDERAL')) return BANK_LOGOS.FEDERAL;
    if (name.includes('PAYTM')) return BANK_LOGOS.PAYTM;
    if (name.includes('GOOGLE') || name.includes('GPAY')) return BANK_LOGOS.GOOGLEPAY;
    if (name.includes('PHONEPE')) return BANK_LOGOS.PHONEPE;
    if (name.includes('BOB') || name.includes('BARODA')) return BANK_LOGOS.BOB;
    if (name.includes('PNB') || name.includes('PUNJAB')) return BANK_LOGOS.PNB;

    return null;
};