let total = 0;

const product = { price: 1, quantity: 3 };

/**
 * A dependency which is a set of effects that should get re-run when values change
 */
const dep: Set<Function> = new Set();

/**
 * A map where we store the dependency object for each property
 */
const depsMap: Map<string, Set<Function>> = new Map();

/**
 * Where we store the dependencies associated with each reactive object's properties
 */
const targetMap = new WeakMap();

/**
 * The code we want to save
 */
const effect = () => {
  total = product.price * product.quantity;
};

/**
 * Save the code we have inside the `effect`
 */
function track(target: object, key: string) {
  let depsMap = targetMap.get(target);

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(effect);
}

/**
 * Run all the saved code
 */
const trigger = (target: object, key: string) => {
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  let dep = depsMap.get(key);

  if (!dep) {
    return;
  }

  dep.forEach((effect) => effect());
};

track(product, "quantity");
effect();
