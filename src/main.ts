/**
 * The user effect that is currently active
 */
let activeEffect = null;

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
function effect(eff: Function) {
  activeEffect = eff;
  activeEffect();
  activeEffect = null;
}

/**
 * Save the code we have inside the `effect`
 */
function track(target: object, key: string | symbol) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
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

/**
 * Gets a primitive value and returns a reactive object based on that value
 * @param raw A primitive value
 * @returns A reactive object
 */
function ref<T>(raw?: T) {
  const r = {
    get value() {
      track(r, "value");
      return raw;
    },
    set value(newValue) {
      raw = newValue;
      trigger(r, "value");
    },
  };
  return r;
}

/**
 * Creates a reactive reference called `result`, run the getter in a `effect`
 * which sets the `result.value` and then returns the result
 * @param getter A function that gets a value
 */
function computed(getter: Function) {
  let result = ref();

  effect(() => (result.value = getter()));

  return result;
}

// Using the Vue 3 functions:

let product = reactive({ price: 1, quantity: 3 });
let salePrice = computed(() => {
  return product.price * 0.9;
});

let total = computed(() => {
  return +salePrice.value * product.quantity;
});
