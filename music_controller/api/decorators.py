import time


def timer(func):
    """Timer decorator
    usage:

    @timer
    def test():
        time.sleep(2)

    output: Time: 2.001234343545 seconds
    """
    def wrapper(*args, **kwargs):
        start = time.time()
        rv = func()
        total = time.time() - start
        print('Time: ', total, ' seconds')
        return rv
    return wrapper
