// Test file to verify unit conversion functionality
import { convertToBaseUnit, areUnitsCompatible, isAmountSufficient } from './units.js'

// Test basic conversions
console.log('=== Testing Unit Conversions ===')

// Weight conversions
console.log('Weight conversions:')
console.log('1000g -> base:', convertToBaseUnit(1000, 'g'), '(should be 1000)')
console.log('1kg -> base:', convertToBaseUnit(1, 'kg'), '(should be 1000)')
console.log('2kg -> base:', convertToBaseUnit(2, 'kg'), '(should be 2000)')

// Volume conversions  
console.log('\nVolume conversions:')
console.log('1000ml -> base:', convertToBaseUnit(1000, 'ml'), '(should be 1000)')
console.log('1L -> base:', convertToBaseUnit(1, 'L'), '(should be 1000)')
console.log('2L -> base:', convertToBaseUnit(2, 'L'), '(should be 2000)')

// Test compatibility
console.log('\n=== Testing Unit Compatibility ===')
console.log('g and kg compatible:', areUnitsCompatible('g', 'kg'), '(should be true)')
console.log('ml and L compatible:', areUnitsCompatible('ml', 'L'), '(should be true)')
console.log('g and ml compatible:', areUnitsCompatible('g', 'ml'), '(should be false)')
console.log('pcs and pieces compatible:', areUnitsCompatible('pcs', 'pieces'), '(should be true)')

// Test amount sufficiency
console.log('\n=== Testing Amount Sufficiency ===')
console.log('2kg >= 1000g:', isAmountSufficient(2, 'kg', 1000, 'g'), '(should be true)')
console.log('1kg >= 1500g:', isAmountSufficient(1, 'kg', 1500, 'g'), '(should be false)')
console.log('2L >= 1000ml:', isAmountSufficient(2, 'L', 1000, 'ml'), '(should be true)')
console.log('1L >= 1500ml:', isAmountSufficient(1, 'L', 1500, 'ml'), '(should be false)')

// Edge cases
console.log('\n=== Testing Edge Cases ===')
console.log('Same units - 100g >= 50g:', isAmountSufficient(100, 'g', 50, 'g'), '(should be true)')
console.log('Same units - 50g >= 100g:', isAmountSufficient(50, 'g', 100, 'g'), '(should be false)')
console.log('Incompatible units - 100g >= 50ml:', isAmountSufficient(100, 'g', 50, 'ml'), '(should be false)')

console.log('\n=== Test Complete ===')