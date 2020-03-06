export const str = `
const test6 = function() {
  console.log("IM TEST 6");
};
const test5 =() => {
  console.log('IM TEST 5')
}

function test4(){
  console.error('IM TEST 4')
}

function test3(){
  console.error('IM TEST 3')
  test4()
}

function test2(){
  console.error('IM TEST 2')
  test3()
}

function test(){
	console.error('IM test')
  setTimeout(function () {
    console.log('Callback function test')
	},1000);
  test2()
}

function customFunc(){
    console.log('Just a simple test')
    test()
}

customFunc();

fetch('https://example.com')
    .then(function(){
        console.log('And another test')
    });

console.warn('Test Console warn');
console.log('Test Console log');
console.error('Test Console error');
console.time('Test Console time');
console.info('Test Console info');

`;
