#!/usr/local/bin/python3
import re
import sys
import os

class SolFile:
    def __init__(self,name,pragma,code,dependencies):
        self.pragma = pragma
        self.name = name
        self.code = code
        self.dependencies = dependencies
    
    def get_name(self):
        return self.name

    def get_pragma(self):
        return self.pragma

    def get_code(self):
        return self.code
    
    def get_dependencies(self):
        return self.dependencies
    
    def get_total_dependencies(self):
        return len(self.dependencies)

def find_imports(content):
    libRegEx = r"import\s*\{.*\} from \"(.*)\""
    normalImportRegEx = r"import\s*\"(.*)\""
    result = re.findall(libRegEx,content)
    result+= re.findall(normalImportRegEx,content)
    return result

def get_pragma(content):
    pragmaRegEx = r"pragma .*;"
    return re.findall(pragmaRegEx,content)[0];

def extract_code(content):
    final_result = ''
    codeDetectorRegEx = r".*"
    result = re.findall(codeDetectorRegEx,content,re.MULTILINE)

    for line in result:
        if line.startswith('import') or line.startswith('pragma') or line == "":
            continue
        removed_dev = re.sub(r".*@dev.*","",line)
        final_result += removed_dev + "\n"
    return final_result

def get_file_content(filePath):
    with open(filePath,"r") as f:
        return f.read()

def get_imported_files(initialdir,imports,dependencies,alreadyImported):
    total_new_imports = []

    for filePath in imports:
        changed_dir = False
        new_abs_imports = [] 

        if filePath in alreadyImported:
            continue

        filePath = os.path.abspath(filePath)
        directoryPath = os.path.split(filePath)[0]

        # Checking if we are on the correct directory
        if os.getcwd().split('/')[-1] != filePath.split('/')[-2]:
            changed_dir = True
            os.chdir(directoryPath)

        alreadyImported.append(filePath)
        content = get_file_content(filePath)
        new_imports = find_imports(content)
        pragma = get_pragma(content)

        for imports in new_imports:
            path = ''
            if not imports.startswith('.'):
                # Using node_modules if the contract is on an external library
                path = initialdir+'/../node_modules/'+imports
            else:
                path = os.path.abspath(imports)

            new_abs_imports.append(path)
            total_new_imports.append(path)
        
        code = extract_code(content)
        solCode = SolFile(filePath,pragma,code,new_abs_imports)
        
        if solCode.get_total_dependencies() not in dependencies:
            dependencies[solCode.get_total_dependencies()] = []
        dependencies[solCode.get_total_dependencies()].append(solCode)

        if changed_dir:
            changed_dir = False
            os.chdir(initialdir)

    return total_new_imports

if __name__ == "__main__":

    if len(sys.argv) < 3:
        print('use Flattener.py origin.sol dest.sol')
        print('\torigin.sol is the original file which will be flattened')
        print('\tdest.sol is the path of the new flattened code')
        exit(1)

    dependencies = dict()
    filePath = os.path.abspath(sys.argv[1])
    directoryPath = os.path.split(filePath)[0]
    initialPath = os.getcwd()
    os.chdir(directoryPath)

    imports = [filePath]
    alreadyImported = []
    
    while len(imports) != 0:
        # if no new imports are found all dependencies are calculated
        imports = get_imported_files(directoryPath,imports,dependencies,alreadyImported)
    
    dependencyNumbers = list(dependencies.keys())
    dependencyNumbers.sort()

    code = ''

    for key in dependencyNumbers:
        for file in dependencies[key]:
            #FIXME check dependencies within the same dependency number
            if code == '':
                code += file.get_pragma() + "\n\n";
            code += file.get_code() + "\n"
    os.chdir(initialPath)
    with open(sys.argv[2],'w+') as f:
        f.write(code)
    
