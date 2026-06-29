const { useState, useEffect, useContext, createContext } = React;
const {
	ThemeProvider, createTheme, CssBaseline,
	Button, TextField, Typography, Box, Container, Paper,
	AppBar, Toolbar, Drawer, List, ListItem, ListItemButton,
	ListItemIcon, ListItemText, Divider,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Chip, Card, CardContent, Grid, Select, MenuItem, FormControl,
	InputLabel, Tab, Tabs, Alert, Snackbar,
} = MaterialUI;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

// ── DATOS DE PRUEBA ──────────────────────────────────────────
const MOCK_USERS = [
	{ id: '1', name: 'María García', email: 'maria.garcia@estudio.cl', role: 'tester' },
	{ id: '2', name: 'Juan Pérez', email: 'juan.perez@estudio.cl', role: 'developer' },
	{ id: '3', name: 'Ana López', email: 'ana.lopez@estudio.cl', role: 'leader' },
	{ id: '4', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@estudio.cl', role: 'developer' },
];

const INITIAL_BUGS = [
	{ id: 'BUG-001', title: 'Error al iniciar sesión', description: 'Mensaje de error intermitente.', version: 'v2.1.0', severity: 'critical', status: 'assigned', reportedBy: 'María García', assignedTo: 'Juan Pérez', createdAt: new Date(), updatedAt: new Date(), screenshots: [], history: [] },
	{ id: 'BUG-002', title: 'Exportar CSV no responde', description: 'No se descarga el archivo CSV.', version: 'v2.0.5', severity: 'medium', status: 'resolved', reportedBy: 'María García', assignedTo: 'Carlos Rodríguez', createdAt: new Date(), updatedAt: new Date(), screenshots: [], history: [] },
	{ id: 'BUG-003', title: 'Gráfico no se actualiza', description: 'Dashboard no refleja cambios recientes.', version: 'v2.1.0', severity: 'high', status: 'open', reportedBy: 'Ana López', assignedTo: undefined, createdAt: new Date(), updatedAt: new Date(), screenshots: [], history: [] },
];

// ── CONSTANTES Y FUNCIONES AUXILIARES ───────────────────────────────
const SEV_LABEL = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };
const SEV_COLOR = { critical: 'error', high: 'warning', medium: 'info', low: 'success' };
const STA_LABEL = { open: 'Abierto', assigned: 'Asignado', in_progress: 'En progreso', resolved: 'Resuelto', verified: 'Verificado', reopened: 'Reabierto' };
const STA_COLOR = { open: 'default', assigned: 'primary', in_progress: 'warning', resolved: 'success', verified: 'success', reopened: 'error' };
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const VERSION_RE = /^v\d+\.\d+\.\d+$/;
const DRAWER_W = 240;

// Iconos SVG simples en línea
const Ico = ({ children, size = 18 }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>{children}</svg>
);
const IcoBug = () => <Ico><rect x="9" y="2" width="6" height="4" rx="2"/><path d="M12 6v6M8 10H4M20 10h-4"/></Ico>;
const IcoPlus = () => <Ico><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>;
const IcoLogout = () => <Ico><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/></Ico>;
const IcoArrow = () => <Ico><polyline points="15 18 9 12 15 6"/></Ico>;
const IcoUser = () => <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const IcoCheck = () => <Ico><polyline points="20 6 9 17 4 12"/></Ico>;
const IcoX = () => <Ico><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>;
const IcoFilter = () => <Ico><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Ico>;
const IcoList = () => <Ico><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Ico>;
const IcoTrend = () => <Ico><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></Ico>;
const IcoDownload = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>;
const IcoRefresh = () => <Ico><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Ico>;

// ── CONTEXTOS ──────────────────────────────────────────
const AuthCtx = createContext(null);
const BugCtx = createContext(null);
const NavCtx = createContext(null);

function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	return <AuthCtx.Provider value={{ user, login: setUser, logout: () => setUser(null) }}>{children}</AuthCtx.Provider>;
}

function BugProvider({ children }) {
	const [bugs, setBugs] = useState(INITIAL_BUGS);
	const addBug = bug => setBugs(p => [...p, bug]);
	const updateBug = (id, upd) => setBugs(p => p.map(b => b.id === id ? { ...b, ...upd, updatedAt: new Date() } : b));
	return <BugCtx.Provider value={{ bugs, addBug, updateBug }}>{children}</BugCtx.Provider>;
}

// ── TEMA ──────────────────────────────────────────────
const theme = createTheme({ palette: { primary: { main: '#1A73E8' } }, typography: { fontFamily: 'Inter, Roboto, sans-serif' } });

// ── COMPONENTES REUTILIZABLES ─────────────────────────────────
function BugTable({ bugs, columns, emptyMsg, onRowClick }) {
	return (
		<TableContainer>
			<Table size="small">
				<TableHead>
					<TableRow sx={{ bgcolor: '#FAFAFA' }}>{columns.map(c => <TableCell key={c.key} sx={{ fontWeight: 600 }}>{c.label}</TableCell>)}</TableRow>
				</TableHead>
				<TableBody>
					{bugs.length === 0 ? <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}><Typography color="text.secondary">{emptyMsg}</Typography></TableCell></TableRow>
						: bugs.map(bug => (<TableRow key={bug.id} hover sx={{ cursor: 'pointer' }} onClick={() => onRowClick(bug.id)}>{columns.map(c => (
							<TableCell key={c.key}>{c.key === 'severity' ? <Chip label={SEV_LABEL[bug.severity]} color={SEV_COLOR[bug.severity]} size="small" /> : c.key === 'status' ? STA_LABEL[bug.status] : bug[c.key] || '–'}</TableCell>
						))}</TableRow>))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

function StatCard({ label, value, color }) {
	return (
		<Card elevation={1}><CardContent><Typography variant="caption" color="text.secondary" display="block">{label}</Typography><Typography variant="h4" color={color || 'text.primary'}>{value}</Typography></CardContent></Card>
	);
}

// ── DISEÑO ─────────────────────────────────────────────
function Layout({ children, page }) {
	const { user, logout } = useContext(AuthCtx);
	const navigate = useContext(NavCtx);
	if (!user) return children;

	const roleLabel = { tester: 'Tester QA', developer: 'Desarrollador', leader: 'Líder Técnico' }[user.role];
	const TESTER_NAV = [{ label: 'Reportar bug', path: 'report', icon: <IcoPlus /> }, { label: 'Mis bugs', path: 'dashboard', icon: <IcoBug /> }];
	const DEV_NAV = [{ label: 'Bugs abiertos', path: 'dashboard', icon: <IcoBug /> }, { label: 'Mis bugs asignados', path: 'dashboard', icon: <IcoList /> }];
	const LEADER_NAV = [{ label: 'Panel', path: 'dashboard', icon: <IcoBug /> }, { label: 'Filtros', path: 'filters', icon: <IcoFilter /> }, { label: 'Resumen', path: 'summary', icon: <IcoTrend /> }];
	const navItems = user.role === 'tester' ? TESTER_NAV : user.role === 'developer' ? DEV_NAV : LEADER_NAV;

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			<AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#1A73E8' }}>
				<Toolbar><Box sx={{ mr: 1.5, color: 'white' }}><IcoBug size={22} /></Box><Typography variant="h6" sx={{ flexGrow: 1 }}>BugTracker</Typography>
					<Typography variant="body2" sx={{ mr: 2 }}>{user.name}</Typography>
					<Button color="inherit" size="small" onClick={() => { logout(); navigate('login'); }} startIcon={<IcoLogout />}>Cerrar sesión</Button>
				</Toolbar>
			</AppBar>
			<Drawer variant="permanent" sx={{ width: DRAWER_W, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_W, top: '64px', height: 'calc(100% - 64px)' } }}>
				<Box sx={{ p: 2 }}><Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{roleLabel}</Typography></Box>
				<Divider />
				<List dense sx={{ px: 1 }}>{navItems.map(item => (<ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}><ListItemButton selected={page === item.path} onClick={() => navigate(item.path)} sx={{ borderRadius: 1.5 }}><ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} /></ListItemButton></ListItem>))}</List>
				<Box sx={{ flexGrow: 1 }} />
				<Divider />
				<List dense sx={{ px: 1 }}><ListItem disablePadding><ListItemButton onClick={() => { logout(); navigate('login'); }} sx={{ color: 'error.main' }}><ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}><IcoLogout /></ListItemIcon><ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 13 }} /></ListItemButton></ListItem></List>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, mt: '64px', p: 3, ml: `${DRAWER_W}px`, bgcolor: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>{children}</Box>
		</Box>
	);
}

// ── INICIO DE SESIÓN ──────────────────────────────────────────────
function validateCredentials(email, password) {
	if (!email || !email.endsWith('@estudio.cl')) return null;
	if (password !== 'password123') return null;
	return MOCK_USERS.find(u => u.email === email) || null;
}

function LoginPage() {
	const { login } = useContext(AuthCtx);
	const navigate = useContext(NavCtx);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = e => { e.preventDefault(); const user = validateCredentials(email, password); if (user) { login(user); navigate('dashboard'); } else setError('Credenciales inválidas.'); };

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EEF3FF' }}>
			<Container maxWidth="sm"><Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
				<Box sx={{ textAlign: 'center', mb: 3 }}><Box sx={{ color: '#1A73E8', mb: 1 }}><IcoBug size={42} /></Box><Typography variant="h4" fontWeight={700}>BugTracker</Typography><Typography variant="body2" color="text.secondary">Sistema de seguimiento de incidencias</Typography></Box>
				{error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
				<form onSubmit={handleSubmit}><TextField fullWidth label="Correo institucional" type="email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" required placeholder="usuario@estudio.cl" /><TextField fullWidth label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} margin="normal" required /><Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2 }}>Iniciar sesión</Button></form>
				<Box sx={{ mt: 3, p: 2, bgcolor: '#F8F9FA', borderRadius: 2 }}>
					<Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>Credenciales de prueba (clic para rellenar):</Typography>
					{[['maria.garcia@estudio.cl','Tester'],['juan.perez@estudio.cl','Dev'],['ana.lopez@estudio.cl','Líder']].map(([em, rol]) => (
						<Box key={em} sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', py: 0.3 }} onClick={() => { setEmail(em); setPassword('password123'); }}><Typography variant="caption" color="primary.main">{em}</Typography><Typography variant="caption" color="text.secondary">{rol}</Typography></Box>
					))}
				</Box>
			</Paper></Container>
		</Box>
	);
}

// ── PANEL ─────────────────────────────────────────
function DashboardPage() {
	const { user } = useContext(AuthCtx);
	const { bugs } = useContext(BugCtx);
	const navigate = useContext(NavCtx);
	if (!user) return null;

	const myBugs = bugs.filter(b => b.reportedBy === user.name);
	const assignMe = bugs.filter(b => b.assignedTo === user.name);
	const resolvedMe = bugs.filter(b => b.status === 'resolved' && b.reportedBy === user.name);
	const openBugs = bugs.filter(b => b.status !== 'resolved' && b.status !== 'verified').sort((a,b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

	if (user.role === 'tester') return (
		<Container maxWidth="lg"><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h5" fontWeight={700}>Dashboard – Tester QA</Typography><Button variant="contained" startIcon={<IcoPlus />} onClick={() => navigate('report')}>Reportar bug</Button></Box>
			<Grid container spacing={3} sx={{ mb: 3 }}><Grid item xs={12} md={4}><StatCard label="Bugs reportados" value={myBugs.length} /></Grid><Grid item xs={12} md={4}><StatCard label="Bugs resueltos" value={resolvedMe.length} color="success.main" /></Grid><Grid item xs={12} md={4}><StatCard label="Pendientes verificar" value={resolvedMe.length} /></Grid></Grid>
			<Paper sx={{ mb: 3 }}><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Mis bugs reportados</Typography></Box><BugTable bugs={myBugs} onRowClick={id => navigate('bug', { id })} emptyMsg="Aún no has reportado ningún bug." columns={[{label:'ID',key:'id'},{label:'Título',key:'title'},{label:'Severidad',key:'severity'},{label:'Estado',key:'status'},{label:'Versión',key:'version'}]} /></Paper>
			<Paper><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Bugs resueltos para verificar</Typography></Box><BugTable bugs={resolvedMe} onRowClick={id => navigate('bug', { id })} emptyMsg="No hay bugs resueltos para verificar." columns={[{label:'ID',key:'id'},{label:'Título',key:'title'},{label:'Severidad',key:'severity'},{label:'Asignado a',key:'assignedTo'}]} /></Paper>
		</Container>
	);

	if (user.role === 'developer') return (
		<Container maxWidth="lg"><Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Dashboard – Desarrollador</Typography>
			<Grid container spacing={3} sx={{ mb: 3 }}><Grid item xs={12} md={6}><StatCard label="Bugs asignados a mí" value={assignMe.length} /></Grid><Grid item xs={12} md={6}><StatCard label="Bugs abiertos totales" value={openBugs.length} /></Grid></Grid>
			<Paper sx={{ mb: 3 }}><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Mis bugs asignados</Typography></Box><BugTable bugs={assignMe} onRowClick={id => navigate('bug', { id })} emptyMsg="No tienes bugs asignados." columns={[{label:'ID',key:'id'},{label:'Título',key:'title'},{label:'Severidad',key:'severity'},{label:'Estado',key:'status'},{label:'Reportado por',key:'reportedBy'}]} /></Paper>
			<Paper><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Bugs abiertos (por severidad)</Typography></Box><BugTable bugs={openBugs} onRowClick={id => navigate('bug', { id })} emptyMsg="No hay bugs abiertos." columns={[{label:'ID',key:'id'},{label:'Título',key:'title'},{label:'Severidad',key:'severity'},{label:'Estado',key:'status'},{label:'Asignado a',key:'assignedTo'}]} /></Paper>
		</Container>
	);

	return (
		<Container maxWidth="lg"><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h5" fontWeight={700}>Dashboard – Líder Técnico</Typography><Box sx={{ display: 'flex', gap: 1.5 }}><Button variant="outlined" startIcon={<IcoFilter />} onClick={() => navigate('filters')}>Filtros avanzados</Button><Button variant="outlined" startIcon={<IcoTrend />} onClick={() => navigate('summary')}>Resumen semanal</Button></Box></Box>
			<Grid container spacing={3} sx={{ mb: 3 }}><Grid item xs={12} md={3}><StatCard label="Total bugs" value={bugs.length} /></Grid><Grid item xs={12} md={3}><StatCard label="Críticos" value={bugs.filter(b=>b.severity==='critical').length} color="error.main" /></Grid><Grid item xs={12} md={3}><StatCard label="Abiertos" value={openBugs.length} /></Grid><Grid item xs={12} md={3}><StatCard label="Resueltos" value={bugs.filter(b=>b.status==='resolved').length} color="success.main" /></Grid></Grid>
			<Paper><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Todos los bugs</Typography></Box>{bugs.length === 0 ? <Box sx={{ p: 5, textAlign: 'center' }}><Typography color="text.secondary">No hay bugs registrados.</Typography></Box> : <BugTable bugs={bugs} onRowClick={id => navigate('bug', { id })} emptyMsg="No hay bugs registrados." columns={[{label:'ID',key:'id'},{label:'Título',key:'title'},{label:'Severidad',key:'severity'},{label:'Estado',key:'status'},{label:'Reportado por',key:'reportedBy'},{label:'Asignado a',key:'assignedTo'}]} />}</Paper>
		</Container>
	);
}

// ── PÁGINA DE REPORTE ───────────────────────────────────────
function ReportBugPage() {
	const { user } = useContext(AuthCtx);
	const { bugs, addBug } = useContext(BugCtx);
	const navigate = useContext(NavCtx);
	const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [version, setVersion] = useState(''); const [severity, setSev] = useState('medium'); const [errors, setErrors] = useState({}); const [success, setSuccess] = useState('');
	const validate = () => { const e = {}; if (!title.trim()) e.title = 'Este campo es obligatorio'; else if (title.length>100) e.title='Máximo 100 caracteres'; if (!desc.trim()) e.desc='Este campo es obligatorio'; if (!version.trim()) e.version='Este campo es obligatorio'; else if (!VERSION_RE.test(version)) e.version='Formato incorrecto. Use vX.Y.Z'; setErrors(e); return !Object.keys(e).length; };
	const handleSubmit = e => { e.preventDefault(); if (!validate() || !user) return; const newId = `BUG-${String(bugs.length + 1).padStart(3,'0')}`; addBug({ id: newId, title: title.trim(), description: desc.trim(), version, severity, status: 'open', reportedBy: user.name, assignedTo: undefined, createdAt: new Date(), updatedAt: new Date(), screenshots: [], history: [{ id: `h${Date.now()}`, timestamp: new Date(), user: user.name, action: 'created', changes: 'Bug creado' }] }); setSuccess(`Bug ${newId} reportado exitosamente`); setTimeout(()=>navigate('dashboard'),1500); };
	return (
		<Container maxWidth="md"><Button startIcon={<IcoArrow />} onClick={() => navigate('dashboard')} sx={{ mb: 2 }}>Volver</Button><Paper sx={{ p: 4 }}><Typography variant="h5" fontWeight={700} gutterBottom>Reportar bug</Typography>{success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}<form onSubmit={handleSubmit} noValidate><TextField fullWidth label="Título *" value={title} onChange={e=>setTitle(e.target.value)} error={!!errors.title} helperText={errors.title||`${title.length}/100`} margin="normal" inputProps={{ maxLength: 100 }} /><TextField fullWidth label="Descripción *" value={desc} onChange={e=>setDesc(e.target.value)} error={!!errors.desc} helperText={errors.desc||`${desc.length}/1000`} margin="normal" multiline rows={4} inputProps={{ maxLength: 1000 }} /><TextField fullWidth label="Versión del build *" value={version} onChange={e=>setVersion(e.target.value)} error={!!errors.version} helperText={errors.version||'Formato: vX.Y.Z — ej: v2.1.0'} margin="normal" placeholder="v2.1.0" /><FormControl fullWidth margin="normal" required><InputLabel>Severidad *</InputLabel><Select value={severity} label="Severidad *" onChange={e=>setSev(e.target.value)}><MenuItem value="low">Baja</MenuItem><MenuItem value="medium">Media</MenuItem><MenuItem value="high">Alta</MenuItem><MenuItem value="critical">Crítica</MenuItem></Select></FormControl><Box sx={{ mt: 2, mb: 1 }}><Typography variant="body2" color="text.secondary" gutterBottom>Adjuntar capturas (opcional)</Typography><Button variant="outlined" component="label" size="small">Seleccionar archivos<input type="file" hidden multiple accept="image/*"/></Button></Box><Box sx={{ display: 'flex', gap: 2, mt: 3 }}><Button type="submit" variant="contained" size="large" fullWidth>Enviar reporte</Button><Button variant="outlined" size="large" onClick={()=>navigate('dashboard')}>Cancelar</Button></Box></form></Paper></Container>
	);
}

// ── DETALLE DE BUG ───────────────────────────────────────
function BugDetailPage({ bugId }) {
	const { user } = useContext(AuthCtx);
	const { bugs, updateBug } = useContext(BugCtx);
	const navigate = useContext(NavCtx);
	const bug = bugs.find(b => b.id === bugId);
	const [tab, setTab] = useState(0); const [techNote, setTechNote] = useState(''); const [showNote, setShowNote] = useState(false); const [reopenR, setReopenR] = useState(''); const [showReopen, setShowR] = useState(false); const [reopenErr, setReopenErr] = useState(''); const [snack, setSnack] = useState('');
	if (!bug || !user) return (<Container maxWidth="lg"><Button startIcon={<IcoArrow />} onClick={() => navigate('dashboard')} sx={{ mb: 2 }}>Volver</Button><Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Bug no encontrado.</Typography></Paper></Container>);
	const addHist = (action, changes) => [...bug.history, { id: `h${Date.now()}`, timestamp: new Date(), user: user.name, action, changes }];
	const canTake = user.role === 'developer' && (bug.status === 'open' || bug.status === 'reopened') && !bug.assignedTo;
	const canResolve = user.role === 'developer' && bug.assignedTo === user.name && (bug.status === 'in_progress' || bug.status === 'assigned');
	const canVerify = user.role === 'tester' && bug.status === 'resolved' && bug.reportedBy === user.name;
	const canReopen = user.role === 'tester' && bug.status === 'resolved' && bug.reportedBy === user.name;
	const canEditSev = user.role === 'leader';
	const handleTake = () => { updateBug(bug.id, { status: 'in_progress', assignedTo: user.name, history: addHist('in_progress', `Asignado a ${user.name}`) }); setSnack('Bug tomado exitosamente.'); };
	const handleResolve = () => { if (!showNote) { setShowNote(true); return; } updateBug(bug.id, { status: 'resolved', history: addHist('resolved', `Marcado como resuelto${techNote ? `. Nota: ${techNote}` : ''}`) }); setShowNote(false); setTechNote(''); setSnack('Bug marcado como resuelto.'); };
	const handleVerify = () => { updateBug(bug.id, { status: 'verified', history: addHist('verified', 'Resolución verificada por el tester') }); setSnack('Bug verificado y cerrado.'); };
	const handleReopen = () => { if (!showReopen) { setShowR(true); return; } if (!reopenR.trim()) { setReopenErr('Debes ingresar un motivo para reabrir el bug.'); return; } setReopenErr(''); updateBug(bug.id, { status: 'reopened', assignedTo: undefined, history: addHist('reopened', `Reabierto. Motivo: ${reopenR}`) }); setShowR(false); setReopenR(''); setSnack('Bug reabierto. Notificación enviada (simulado).'); };

	return (
		<Container maxWidth="lg"><Button startIcon={<IcoArrow />} onClick={() => navigate('dashboard')} sx={{ mb: 2 }}>Volver al dashboard</Button><Paper sx={{ p: 4 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}><Box><Typography variant="h5" fontWeight={700}>{bug.title}</Typography><Typography variant="caption" color="text.secondary">{bug.id}</Typography></Box><Box sx={{ display: 'flex', gap: 1 }}><Chip label={SEV_LABEL[bug.severity]} color={SEV_COLOR[bug.severity]} /><Chip label={STA_LABEL[bug.status] || bug.status} color={STA_COLOR[bug.status] || 'default'} variant="outlined" /></Box></Box>
			<Tabs value={tab} onChange={(_, v)=>setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}><Tab label="Información" /><Tab label="Historial" /></Tabs>
			{tab === 0 && (<Grid container spacing={3}><Grid item xs={12} md={8}><Typography variant="h6" fontWeight={600} gutterBottom>Descripción</Typography><Typography variant="body1" sx={{ mb: 3 }}>{bug.description}</Typography>{showNote && <TextField fullWidth label="Nota técnica (opcional)" multiline rows={3} value={techNote} onChange={e=>setTechNote(e.target.value)} sx={{ mb: 2 }} />}{showReopen && <TextField fullWidth label="Motivo para reabrir *" multiline rows={3} value={reopenR} onChange={e=>setReopenR(e.target.value)} error={!!reopenErr} helperText={reopenErr} sx={{ mb: 2 }} />}<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{canTake && <Button variant="contained" startIcon={<IcoUser />} onClick={handleTake}>Tomar bug</Button>}{canResolve && <Button variant="contained" color="success" startIcon={<IcoCheck />} onClick={handleResolve}>{showNote ? 'Confirmar resolución' : 'Marcar como resuelto'}</Button>}{canVerify && <Button variant="contained" color="success" startIcon={<IcoCheck />} onClick={handleVerify}>Verificar resolución</Button>}{canReopen && <Button variant="outlined" color="error" startIcon={<IcoX />} onClick={handleReopen}>{showReopen ? 'Confirmar reapertura' : 'Reabrir bug'}</Button>}</Box></Grid><Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, mb: 2 }}><Typography variant="h6" fontWeight={600} gutterBottom>Información</Typography>{[['Versión',bug.version],['Reportado por',bug.reportedBy],['Asignado a',bug.assignedTo||'Sin asignar'],['Creado',new Date(bug.createdAt).toLocaleDateString('es-CL')],['Actualizado',new Date(bug.updatedAt).toLocaleDateString('es-CL')]].map(([k,v]) => (<Box key={k} sx={{ mb: 1.5 }}><Typography variant="caption" color="text.secondary" display="block">{k}</Typography><Typography variant="body2" fontWeight={500}>{v}</Typography></Box>))}</Paper>{canEditSev && (<Paper variant="outlined" sx={{ p: 2 }}><Typography variant="subtitle2" fontWeight={600} gutterBottom>Cambiar severidad</Typography><FormControl fullWidth size="small" sx={{ mb: 1 }}><InputLabel>Severidad</InputLabel><Select value={bug.severity} label="Severidad" onChange={e=>updateBug(bug.id,{ severity: e.target.value })}><MenuItem value="low">Baja</MenuItem><MenuItem value="medium">Media</MenuItem><MenuItem value="high">Alta</MenuItem><MenuItem value="critical">Crítica</MenuItem></Select></FormControl></Paper>)}</Grid></Grid>)}
			{tab === 1 && (<Box><Typography variant="h6" fontWeight={600} gutterBottom>Historial de cambios</Typography>{bug.history.length === 0 ? <Typography color="text.secondary">No hay cambios registrados para este bug.</Typography> : [...bug.history].reverse().map(e => (<Box key={e.id} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #1A73E8' }}><Typography variant="caption" color="text.secondary">{new Date(e.timestamp).toLocaleString('es-CL')} — <strong>{e.user}</strong></Typography><Typography variant="body2">{e.changes}</Typography></Box>))}</Box>)}
			</Paper><Snackbar open={!!snack} autoHideDuration={3000} onClose={()=>setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="success" onClose={()=>setSnack('')}>{snack}</Alert></Snackbar></Container>
	);
}

// ── FILTROS ───────────────────────────────────────────
function FiltersPage() {
	const { bugs } = useContext(BugCtx);
	const navigate = useContext(NavCtx);
	const [fVer, setFVer] = useState(''); const [fSev, setFSev] = useState(''); const [fSta, setFSta] = useState(''); const [fAss, setFAss] = useState(''); const [snack, setSnack] = useState('');
	const versions = [...new Set(bugs.map(b=>b.version))]; const developers = MOCK_USERS.filter(u => u.role === 'developer');
	const filtered = bugs.filter(b => { if (fVer && b.version !== fVer) return false; if (fSev && b.severity !== fSev) return false; if (fSta && b.status !== fSta) return false; if (fAss === '__none__' && b.assignedTo) return false; if (fAss && fAss !== '__none__' && b.assignedTo !== fAss) return false; return true; });
	const handleExport = () => { const rows = [['ID','Título','Severidad','Estado','Versión','Reportado por','Asignado a'], ...filtered.map(b => [b.id, b.title, b.severity, b.status, b.version, b.reportedBy, b.assignedTo||''])]; const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'bugs-export.csv'; a.click(); URL.revokeObjectURL(url); setSnack('Exportando lista filtrada...'); };
	return (<Container maxWidth="lg"><Button startIcon={<IcoArrow />} onClick={()=>navigate('dashboard')} sx={{ mb: 2 }}>Volver</Button><Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Filtros avanzados</Typography><Paper sx={{ p: 3, mb: 3 }}><Grid container spacing={2}><Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Versión</InputLabel><Select value={fVer} label="Versión" onChange={e=>setFVer(e.target.value)}><MenuItem value="">Todas</MenuItem>{versions.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Severidad</InputLabel><Select value={fSev} label="Severidad" onChange={e=>setFSev(e.target.value)}><MenuItem value="">Todas</MenuItem><MenuItem value="critical">Crítica</MenuItem><MenuItem value="high">Alta</MenuItem><MenuItem value="medium">Media</MenuItem><MenuItem value="low">Baja</MenuItem></Select></FormControl></Grid><Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Estado</InputLabel><Select value={fSta} label="Estado" onChange={e=>setFSta(e.target.value)}><MenuItem value="">Todos</MenuItem><MenuItem value="open">Abierto</MenuItem><MenuItem value="assigned">Asignado</MenuItem><MenuItem value="in_progress">En progreso</MenuItem><MenuItem value="resolved">Resuelto</MenuItem><MenuItem value="verified">Verificado</MenuItem><MenuItem value="reopened">Reabierto</MenuItem></Select></FormControl></Grid><Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Asignado a</InputLabel><Select value={fAss} label="Asignado a" onChange={e=>setFAss(e.target.value)}><MenuItem value="">Todos</MenuItem><MenuItem value="__none__">Sin asignar</MenuItem>{developers.map(d => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}</Select></FormControl></Grid></Grid><Box sx={{ display: 'flex', gap: 2, mt: 2 }}><Button variant="outlined" onClick={() => { setFVer(''); setFSev(''); setFSta(''); setFAss(''); }}>Limpiar filtros</Button><Button variant="contained" startIcon={<IcoDownload />} onClick={handleExport}>Exportar CSV</Button></Box></Paper><Paper><Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}><Typography variant="h6" fontWeight={600}>Resultados ({filtered.length})</Typography></Box><TableContainer><Table size="small"><TableHead><TableRow sx={{ bgcolor: '#FAFAFA' }}>{['ID','Título','Severidad','Estado','Versión','Asignado a','Acción'].map(h => <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No hay bugs con esos criterios.</Typography></TableCell></TableRow> : filtered.map(bug => (<TableRow key={bug.id} hover><TableCell>{bug.id}</TableCell><TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bug.title}</TableCell><TableCell><Chip label={SEV_LABEL[bug.severity]} color={SEV_COLOR[bug.severity]} size="small" /></TableCell><TableCell>{STA_LABEL[bug.status]}</TableCell><TableCell>{bug.version}</TableCell><TableCell>{bug.assignedTo || '–'}</TableCell><TableCell><Button size="small" variant="outlined" onClick={() => navigate('bug', { id: bug.id })}>Ver</Button></TableCell></TableRow>))}</TableBody></Table></TableContainer></Paper><Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="info" onClose={() => setSnack('')}>{snack}</Alert></Snackbar></Container>);
}

// ── RESUMEN ───────────────────────────────────────────
function SummaryPage() {
	const { bugs } = useContext(BugCtx);
	const navigate = useContext(NavCtx);
	const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
	const genData = () => DAYS.map(d => ({ day: d, Reportados: Math.floor(Math.random()*6), Resueltos: Math.floor(Math.random()*5) }));
	const [chart, setChart] = useState(genData);
	const total = bugs.length; const open = bugs.filter(b=>b.status!=='resolved' && b.status!=='verified').length; const resolved = bugs.filter(b=>b.status==='resolved' || b.status==='verified').length; const critical = bugs.filter(b=>b.severity==='critical').length;
	return (
		<Container maxWidth="lg"><Button startIcon={<IcoArrow />} onClick={() => navigate('dashboard')} sx={{ mb: 2 }}>Volver</Button><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h5" fontWeight={700}>Resumen semanal</Typography><Button variant="outlined" startIcon={<IcoRefresh />} onClick={() => setChart(genData())}>Generar ahora</Button></Box><Grid container spacing={3} sx={{ mb: 3 }}><Grid item xs={12} sm={6} md={3}><StatCard label="Total bugs" value={total} /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Abiertos" value={open} /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Resueltos" value={resolved} color="success.main" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Críticos" value={critical} color="error.main" /></Grid></Grid><Paper sx={{ p: 3, mb: 3 }}><Typography variant="h6" fontWeight={600} gutterBottom>Bugs reportados vs resueltos – últimos 7 días</Typography><ResponsiveContainer width="100%" height={280}><BarChart data={chart} margin={{ top:5, right:20, left:0, bottom:5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Reportados" fill="#1A73E8" radius={[4,4,0,0]} /><Bar dataKey="Resueltos" fill="#34A853" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></Paper></Container>
	);
}

// ── RAÍZ DE LA APP ──────────────────────────────────────────
function App() {
	const [page, setPage] = useState('login');
	const [params, setParams] = useState({});
	const navigate = (p, extra = {}) => { setPage(p); setParams(extra); };
	const renderPage = () => { switch (page) { case 'login': return <LoginPage />; case 'dashboard': return <DashboardPage />; case 'report': return <ReportBugPage />; case 'bug': return <BugDetailPage bugId={params.id} />; case 'filters': return <FiltersPage />; case 'summary': return <SummaryPage />; default: return <DashboardPage />; } };
	return (<ThemeProvider theme={theme}><CssBaseline /><AuthProvider><BugProvider><NavCtx.Provider value={navigate}><Layout page={page}>{renderPage()}</Layout></NavCtx.Provider></BugProvider></AuthProvider></ThemeProvider>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
