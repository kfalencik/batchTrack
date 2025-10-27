/**
 * Unit conversion utilities for recipe ingredient comparisons
 */

/**
 * Convert amount to base unit (grams for weight, ml for volume)
 * @param {number} amount - The amount to convert
 * @param {string} unit - The unit to convert from
 * @returns {number} - Amount in base unit (g for weight, ml for volume)
 */
export function convertToBaseUnit(amount, unit) {
    if (!amount || !unit) return 0
    
    const numAmount = parseFloat(amount)
    if (!Number.isFinite(numAmount)) return 0
    
    const normalizedUnit = unit.toLowerCase().trim()
    
    // Weight conversions (to grams)
    switch (normalizedUnit) {
        case 'g':
        case 'gram':
        case 'grams':
            return numAmount
        case 'kg':
        case 'kilogram':
        case 'kilograms':
            return numAmount * 1000
        case 'oz':
        case 'ounce':
        case 'ounces':
            return numAmount * 28.3495
        case 'lb':
        case 'pound':
        case 'pounds':
            return numAmount * 453.592
    }
    
    // Volume conversions (to ml)
    switch (normalizedUnit) {
        case 'ml':
        case 'milliliter':
        case 'milliliters':
        case 'millilitre':
        case 'millilitres':
            return numAmount
        case 'l':
        case 'liter':
        case 'liters':
        case 'litre':
        case 'litres':
            return numAmount * 1000
        case 'cl':
        case 'centiliter':
        case 'centiliters':
        case 'centilitre':
        case 'centilitres':
            return numAmount * 10
        case 'fl oz':
        case 'fluid ounce':
        case 'fluid ounces':
            return numAmount * 29.5735
        case 'cup':
        case 'cups':
            return numAmount * 236.588
        case 'pint':
        case 'pints':
            return numAmount * 473.176
        case 'quart':
        case 'quarts':
            return numAmount * 946.353
        case 'gallon':
        case 'gallons':
            return numAmount * 3785.41
    }
    
    // Count/pieces - return as is
    switch (normalizedUnit) {
        case 'pcs':
        case 'piece':
        case 'pieces':
        case 'count':
        case 'item':
        case 'items':
        case 'unit':
        case 'units':
            return numAmount
    }
    
    // Default: return as is if unit is not recognized
    console.warn(`Unknown unit: ${unit}. Treating as raw amount.`)
    return numAmount
}

/**
 * Check if two units are compatible for comparison
 * @param {string} unit1 - First unit
 * @param {string} unit2 - Second unit
 * @returns {boolean} - True if units can be compared
 */
export function areUnitsCompatible(unit1, unit2) {
    if (!unit1 || !unit2) return false
    
    const weightUnits = ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'oz', 'ounce', 'ounces', 'lb', 'pound', 'pounds']
    const volumeUnits = ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres', 'l', 'liter', 'liters', 'litre', 'litres', 'cl', 'centiliter', 'centiliters', 'centilitre', 'centilitres', 'fl oz', 'fluid ounce', 'fluid ounces', 'cup', 'cups', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons']
    const countUnits = ['pcs', 'piece', 'pieces', 'count', 'item', 'items', 'unit', 'units']
    
    const norm1 = unit1.toLowerCase().trim()
    const norm2 = unit2.toLowerCase().trim()
    
    const isWeight1 = weightUnits.includes(norm1)
    const isWeight2 = weightUnits.includes(norm2)
    
    const isVolume1 = volumeUnits.includes(norm1)
    const isVolume2 = volumeUnits.includes(norm2)
    
    const isCount1 = countUnits.includes(norm1)
    const isCount2 = countUnits.includes(norm2)
    
    return (isWeight1 && isWeight2) || (isVolume1 && isVolume2) || (isCount1 && isCount2)
}

/**
 * Compare if available amount is sufficient for required amount, considering units
 * @param {number} availableAmount - Amount available in stock
 * @param {string} availableUnit - Unit of available amount
 * @param {number} requiredAmount - Amount required by recipe
 * @param {string} requiredUnit - Unit of required amount
 * @returns {boolean} - True if available amount is sufficient
 */
export function isAmountSufficient(availableAmount, availableUnit, requiredAmount, requiredUnit) {
    if (!availableAmount || !requiredAmount) return false
    
    // If units are the same, do simple comparison
    if (availableUnit && requiredUnit && availableUnit.toLowerCase().trim() === requiredUnit.toLowerCase().trim()) {
        return parseFloat(availableAmount) >= parseFloat(requiredAmount)
    }
    
    // Check if units are compatible for conversion
    if (!areUnitsCompatible(availableUnit, requiredUnit)) {
        console.warn(`Incompatible units: ${availableUnit} vs ${requiredUnit}. Cannot compare.`)
        return false
    }
    
    // Convert both to base units and compare
    const availableInBase = convertToBaseUnit(availableAmount, availableUnit)
    const requiredInBase = convertToBaseUnit(requiredAmount, requiredUnit)
    
    return availableInBase >= requiredInBase
}