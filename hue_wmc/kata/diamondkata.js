function diamond(letter) {
  letter = letter.toUpperCase();
  
  const maxIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);
  
  let result = [];
  
  for (let i = 0; i <= maxIndex; i++) {
    const currentLetter = String.fromCharCode('A'.charCodeAt(0) + i);
    const leadingSpaces = ' '.repeat(maxIndex - i);
    
    if (i === 0) {
      result.push(leadingSpaces + currentLetter);
    } else {
      const middleSpaces = ' '.repeat(2 * i - 1);
      result.push(leadingSpaces + currentLetter + middleSpaces + currentLetter);
    }
  }
  
  for (let i = maxIndex - 1; i >= 0; i--) {
    const currentLetter = String.fromCharCode('A'.charCodeAt(0) + i);
    const leadingSpaces = ' '.repeat(maxIndex - i);
    
    if (i === 0) {
      result.push(leadingSpaces + currentLetter);
    } else {
      const middleSpaces = ' '.repeat(2 * i - 1);
      result.push(leadingSpaces + currentLetter + middleSpaces + currentLetter);
    }
  }
  
  return result.join('\n');
}

function testDiamond() {
  
  console.log("Diamond B:");
  console.log(diamond('B'));
  
  console.log("\n");
  
  console.log("Diamond C:");
  console.log(diamond('C'));
  
  console.log("\n");
  
  console.log("Diamond D:");
  console.log(diamond('D'));
}

testDiamond();
