import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import CloudAccounts from './pages/CloudAccounts';
import Deployments from './pages/Deployments';
import Resources from './pages/Resources';
import RDPViewer from './pages/RDPViewer';
import ProvisionCompute from './pages/ProvisionCompute';
import CreateVM from './pages/CreateVM';
import Projects from './pages/Projects';
import Governance from './pages/Governance';
import K8sFleet from './pages/K8sFleet';
import AuditLogs from './pages/AuditLogs';
import Marketplace from './pages/Marketplace';
import Serverless from './pages/Serverless';
import NetworkMap from './pages/NetworkMap';
import SecurityPulse from './pages/SecurityPulse';
import DisasterRecovery from './pages/DisasterRecovery';
import PolicyEditor from './pages/PolicyEditor';
import CommandCenter from './pages/CommandCenter';
import EvidenceVault from './pages/EvidenceVault';
import Budgets from './pages/Budgets';
import SelfHealingHQ from './pages/SelfHealingHQ';
import EdgeNodes from './pages/EdgeNodes';
import WarpCommand from './pages/WarpCommand';
import PluginHub from './pages/PluginHub';
import GitOps from './pages/GitOps';
import MeshControl from './pages/MeshControl';
import EvolutionTrace from './pages/EvolutionTrace';
import ComplianceVault from './pages/ComplianceVault';
import Rightsizing from './pages/Rightsizing';
import ServiceHub from './pages/ServiceHub';
import BlueprintStudio from './pages/BlueprintStudio';

const ProtectedRoute = ({ children }) => {
    // ... (rest of the file remains same)
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/rdp/:id" element={<ProtectedRoute><RDPViewer /></ProtectedRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="billing" element={<Billing />} />
          <Route path="resources" element={<Resources />} />
          <Route path="accounts" element={<CloudAccounts />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="provision" element={<ProvisionCompute />} />
          <Route path="create-vm" element={<CreateVM />} />
          <Route path="projects" element={<Projects />} />
          <Route path="governance" element={<Governance />} />
          <Route path="kubernetes" element={<K8sFleet />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="serverless" element={<Serverless />} />
          <Route path="network" element={<NetworkMap />} />
          <Route path="security-pulse" element={<SecurityPulse />} />
          <Route path="dr" element={<DisasterRecovery />} />
          <Route path="policy-editor" element={<PolicyEditor />} />
          <Route path="command-center" element={<CommandCenter />} />
          <Route path="evidence-vault" element={<EvidenceVault />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="self-healing" element={<SelfHealingHQ />} />
          <Route path="edge-nodes" element={<EdgeNodes />} />
          <Route path="warp-command" element={<WarpCommand />} />
          <Route path="plugin-hub" element={<PluginHub />} />
          <Route path="gitops" element={<GitOps />} />
          <Route path="mesh-hq" element={<MeshControl />} />
          <Route path="evolution-trace" element={<EvolutionTrace />} />
          <Route path="compliance" element={<ComplianceVault />} />
          <Route path="rightsizing" element={<Rightsizing />} />
          <Route path="services" element={<ServiceHub />} />
          <Route path="blueprint-studio" element={<BlueprintStudio />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
