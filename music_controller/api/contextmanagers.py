from contextlib import contextmanager


@contextmanager
def file(filename, method):
    _file = open(filename, method)
    yield _file
    _file.close()

# class File:
#     def __init__(self, filename, method):
#         self.file = open(filename, method)

#     def __enter__(self):
#         print('Enter')
#         return self.file

#     def __exit__(self, exc_type, exc_value, trace):
#         print(f'{exc_type}, {exc_value}, {trace}')
#         print('Exit')
#         self.file.close()

#         if exc_type == Exception:
#             return True

    """Usage of context manage File
            with file("file.txt", "w") as f:
                print('Middle')
                f.write('Hello')
                raise FileExistsError()
        """
