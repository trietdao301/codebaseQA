def outer_function(x):
    """A function with a nested function and a lambda."""

    # Nested function
    def nested_add(y):
        return x + y

    # Lambda function
    multiply = lambda z: z * 2

    # Using both
    result_add = nested_add(5)
    result_mul = multiply(result_add)

    return result_mul


def higher_order_function(lst):
    """A function with a nested function that returns a lambda."""

    def create_multiplier(factor):
        # This nested function returns a lambda
        return lambda n: n * factor

    double = create_multiplier(2)
    triple = create_multiplier(3)

    return [double(n) + triple(n) for n in lst]


# Example usage:
print(outer_function(10))       # 30
print(higher_order_function([1, 2, 3]))  # [5, 10, 15]