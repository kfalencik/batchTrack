export const useCurrency = () => {
    const settingsStore = useSettingsStore()
    
    // Format a number as currency based on current settings
    const formatCurrency = (amount: number): string => {
        const currency = settingsStore.currentCurrency
        
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.code,
                currencyDisplay: 'symbol'
            }).format(amount)
        } catch (error) {
            // Fallback to manual formatting if Intl is not supported
            return `${currency.symbol}${amount.toFixed(2)}`
        }
    }
    
    // Format currency without symbol (just the number)
    const formatAmount = (amount: number): string => {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }
    
    // Get currency symbol
    const getCurrencySymbol = (): string => {
        return settingsStore.currentCurrency.symbol
    }
    
    // Get currency code
    const getCurrencyCode = (): string => {
        return settingsStore.currentCurrency.code
    }
    
    return {
        formatCurrency,
        formatAmount,
        getCurrencySymbol,
        getCurrencyCode
    }
}