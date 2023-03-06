let total = 0;

let product = reactive({ price: 1, quantity: 3 });

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
function track(target: object, key: string | symbol) {
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
const trigger = (target: object, key: string | symbol) => {
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

/**
 * Gets an object, creates a reactive proxy of that object, and returns that proxy.
 * @param target an object to make it reactive
 * @returns a reactive proxy of the target object
 */
function reactive<T>(target: T): T {
  const handler: ProxyHandler<object> = {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (result && oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
  };
  return new Proxy(target as object, handler) as T;
}

effect();
