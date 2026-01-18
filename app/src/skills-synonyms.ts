const synonymMap: { [key: string]: string[] } = {
    // === LANGUAGES ===
    'Java': ['Java', 'J2EE', 'Jakarta EE', 'JVM'],
    'JavaScript': ['JavaScript', 'JS', 'ECMAScript', 'ES6', 'Vanilla JS'],
    'TypeScript': ['TypeScript', 'TS'],
    'Python': ['Python', 'Py', 'Python3'],
    'C#': ['C#', 'CSharp'],
    'C++': ['C++', 'Cpp', 'C Plus Plus'],
    'PHP': ['PHP', 'PHP7', 'PHP8'],
    'Go': ['Go', 'Golang'],
    'Ruby': ['Ruby', 'Rb'],
    'Kotlin': ['Kotlin'],
    'Swift': ['Swift'],
    'SQL': ['SQL', 'T-SQL', 'PL/SQL'], 

    // === FRONTEND ===
    'React': ['React', 'React.js', 'ReactJS'],
    'Angular': ['Angular', 'AngularJS', 'Angular 2+'],
    'Vue': ['Vue', 'Vue.js', 'VueJS', 'Vue3'],
    'Next.js': ['Next.js', 'NextJS', 'Next'],
    'HTML': ['HTML', 'HTML5'],
    'CSS': ['CSS', 'CSS3', 'SCSS', 'SASS'],

    // === BACKEND ===
    'Spring': ['Spring', 'Spring Boot', 'Spring Framework', 'SpringBoot'],
    'Node.js': ['Node.js', 'Node', 'NodeJS'],
    '.NET': ['.NET', '.NET Core', 'ASP.NET', 'ASP.NET Core'],
    'Django': ['Django', 'Django Rest Framework', 'DRF'],
    'Flask': ['Flask'],
    'FastAPI': ['FastAPI'],
    'Symfony': ['Symfony'],
    'Laravel': ['Laravel'],
    'Ruby on Rails': ['Ruby on Rails', 'RoR', 'Rails'],
    'NestJS': ['NestJS', 'Nest', 'Nest.js'],
    'Hibernate': ['Hibernate', 'JPA'],

    // === MOBILE ===
    'Android': ['Android', 'Android SDK'],
    'iOS': ['iOS'], 
    'Flutter': ['Flutter'],
    'React Native': ['React Native', 'ReactNative', 'RN'],

    // === DATABASE ===
    'MySQL': ['MySQL'],
    'PostgreSQL': ['PostgreSQL', 'Postgres'],
    'MSSQL': ['MSSQL', 'SQL Server', 'Microsoft SQL Server'],
    'MongoDB': ['MongoDB', 'Mongo', 'Mongoose'],
    'Redis': ['Redis'],
    'Oracle': ['Oracle', 'Oracle DB'],

    // === DEVOPS ===
    'Docker': ['Docker', 'Dockerfile'],
    'Kubernetes': ['Kubernetes', 'K8s', 'Kube'],
    'AWS': ['AWS', 'Amazon Web Services'],
    'Azure': ['Azure', 'Microsoft Azure'],
    'Google Cloud': ['Google Cloud', 'GCP', 'Google Cloud Platform'],
    'Linux': ['Linux', 'Bash', 'Shell'],
    'Git': ['Git'],
    'GitHub': ['GitHub', 'Github Actions'],
    'GitLab': ['GitLab', 'GitLab CI'],
    'CI/CD': ['CI/CD', 'CI', 'CD', 'Pipelines', 'Jenkins', 'Bamboo', 'Travis']
};


export function getSynonyms(skill: string): string[] {
    const key = skill.trim();
    return synonymMap[key] || [key];
}