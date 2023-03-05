let price = 1;
let quantity = 3;
let total = 0;

const dep = new Set();

const effect = () => {
  total = price * quantity;
};

function track() {
  dep.add(effect);
}

const trigger = () => {
  dep.forEach((eff: any) => eff());
};

track();
effect();
