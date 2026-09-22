/** A few well-known molecules so the app is usable without knowing SMILES. */

export interface ExampleMolecule {
  name: string
  smiles: string
  note: string
}

export const EXAMPLE_MOLECULES: ExampleMolecule[] = [
  { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O', note: 'FDA-approved analgesic' },
  { name: 'Caffeine', smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C', note: 'Stimulant' },
  { name: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1', note: 'Analgesic' },
  { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O', note: 'NSAID' },
  { name: 'Ethanol', smiles: 'CCO', note: 'Simple alcohol' },
  { name: 'Penicillin G', smiles: 'CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O', note: 'Antibiotic' },
  { name: 'Nicotine', smiles: 'CN1CCCC1c1cccnc1', note: 'Alkaloid' },
  { name: 'Thalidomide', smiles: 'O=C1CCC(N2C(=O)c3ccccc3C2=O)C(=O)N1', note: 'Withdrawn for toxicity' },
]

/** A batch that exercises valid, duplicate and malformed input at once. */
export const SAMPLE_BATCH = [
  'CC(=O)Oc1ccccc1C(=O)O',
  'Cn1cnc2c1c(=O)n(C)c(=O)n2C',
  'CC(=O)Nc1ccc(O)cc1',
  'CCO',
].join('\n')
