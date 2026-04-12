import * as fs from 'fs';
import * as path from 'path';

const modelsDir = path.join(import.meta.dir, 'src', 'models');

const modelsToFix = [
    'users.ts', 
    'students.ts', 
    'groups.ts', 
    'classrooms.ts', 
    'online_classrooms.ts', 
    'classroom_reservations.ts', 
    'reservation_cycles.ts'
];

for (const file of modelsToFix) {
    let content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');

    // Make _select schema exported
    content = content.replace(/const _select/g, "export const _select");

    // Remove composite definitions
    content = content.replace(/export const selectComposite[\s\S]*?\]\);/g, "");
    content = content.replace(/export const paginated.*ResponseSchema = createPaginationResponseSchema.*\);/g, "");

    // Remove imports from other models!
    content = content.replace(/import \{ selectSimple.* \} from '\..*';\n/g, "");

    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

    fs.writeFileSync(path.join(modelsDir, file), content, 'utf-8');
}

// Now we need to update the routes so they import the composite schemas from `./composite` instead of the original models
const routesDir = path.join(import.meta.dir, 'src', 'routes');
for (const file of fs.readdirSync(routesDir)) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    let content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    
    // Anything importing selectComposite or paginated from `../models/xxx` needs to be updated.
    // Instead of parsing, let's just globally replace imports of selectCompositeX and paginatedX with import from composite.
    const compositeMatch = content.match(/selectComposite[A-Za-z]+Schema/);
    const paginatedMatch = content.match(/paginated[A-Za-z]+ResponseSchema/);
    
    if (compositeMatch || paginatedMatch) {
       // First remove them from their original import statements
       content = content.replace(/,\s*selectComposite[A-Za-z]+Schema/g, "");
       content = content.replace(/selectComposite[A-Za-z]+Schema,\s*/g, "");
       content = content.replace(/,\s*paginated[A-Za-z]+ResponseSchema/g, "");
       content = content.replace(/paginated[A-Za-z]+ResponseSchema,\s*/g, "");

       const toImport = [];
       if (compositeMatch) toImport.push(compositeMatch[0]);
       if (paginatedMatch) toImport.push(paginatedMatch[0]);

       if (toImport.length > 0) {
           content = `import { ${toImport.join(', ')} } from "../models/composite";\n` + content;
       }
    }

    fs.writeFileSync(path.join(routesDir, file), content, 'utf-8');
}

console.log("Models and routes updated to use composite.ts");
