import { ref, computed } from '@vue-clone';

const count = ref(0);

const plusOne = computed(() => count.value + 1);

console.log(plusOne.value); // 1
count.value++;
console.log(plusOne.value); // 2
