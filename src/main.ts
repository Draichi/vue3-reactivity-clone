/**
 * The user effect that is currently active
 */
let activeEffect: Function | null = null;

/**
 * Where we store the dependencies associated with each reactive object's properties
 */
const targetMap: WeakMap<
  Object,
  Map<string | symbol, Set<Function>>
> = new WeakMap();

/**
 * The code we want to save
 */
function effect(eff: () => void) {
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
export function reactive<T>(target: T): T {
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
export function ref<T>(raw?: T): { value: T } {
  const r = {
    get value() {
      track(r, "value");
      return raw || (null as T);
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
export function computed(getter: () => void) {
  let result = ref();

  effect(() => (result.value = getter()));

  return result;
}
