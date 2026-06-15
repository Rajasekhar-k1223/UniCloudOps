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
import HealthMonitor from './pages/HealthMonitor';
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
import MissionArchitect from './pages/MissionArchitect';
import ChaosCommand from './pages/ChaosCommand';
import PolicyGuard from './pages/PolicyGuard';
import QuantumTerminal from './pages/QuantumTerminal';
import TrafficController from './pages/TrafficController';
import MissionContinuity from './pages/MissionContinuity';
import FinOpsBroker from './pages/FinOpsBroker';
import NeuralIdentity from './pages/NeuralIdentity';
import QuantumPredictor from './pages/QuantumPredictor';
import MissionForge from './pages/MissionForge';
import ActiveDefense from './pages/ActiveDefense';
import KnowledgeMesh from './pages/KnowledgeMesh';
import ImmersiveOps from './pages/ImmersiveOps';
import SelfEvolvingEngine from './pages/SelfEvolvingEngine';
import StrategicWarRoom from './pages/StrategicWarRoom';
import CommanderBriefing from './pages/CommanderBriefing';
import QuantumShield from './pages/QuantumShield';
import GalacticMesh from './pages/GalacticMesh';
import TemporalCommand from './pages/TemporalCommand';
import NeuralAdvisor from './pages/NeuralAdvisor';
import PostMortems from './pages/PostMortems';
import ResourceAuction from './pages/ResourceAuction';
import UniversalRegistry from './pages/UniversalRegistry';
import ThreatHunting from './pages/ThreatHunting';
import QuantumBridge from './pages/QuantumBridge';
import MacroForge from './pages/MacroForge';
import NeuralBioLink from './pages/NeuralBioLink';
import SpaceMesh from './pages/SpaceMesh';
import SentientHealing from './pages/SentientHealing';
import DataSingularity from './pages/DataSingularity';
import EconomicEmpire from './pages/EconomicEmpire';
import GalacticGovernance from './pages/GalacticGovernance';
import MultiVersalRedundancy from './pages/MultiVersalRedundancy';

const ProtectedRoute = ({ children }) => {
    // ... (rest of the file remains same)
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import IAMDashboard from './pages/IAMDashboard';
import TenantsDashboard from './pages/TenantsDashboard';
import TerraformEnterprise from './pages/TerraformEnterprise';
import SecretsVault from './pages/SecretsVault';
import K8sControlCenter from './pages/K8sControlCenter';
import CloudGovernance from './pages/CloudGovernance';
import FinOpsCenter from './pages/FinOpsCenter';
import ObservabilityCenter from './pages/ObservabilityCenter';
import AIOpsCenter from './pages/AIOpsCenter';
import SecurityPosture from './pages/SecurityPosture';
import EventDashboard from './pages/EventDashboard';
import AIAgentSwarm from './pages/AIAgentSwarm';
import CustomerPortal from './pages/CustomerPortal';
import MSPDashboard from './pages/MSPDashboard';
import SOCDashboard from './pages/SOCDashboard';
import VaultAndCompliance from './pages/VaultAndCompliance';
import SecurityFabricDashboard from './pages/SecurityFabricDashboard';
import EventSecurityDashboard from './pages/EventSecurityDashboard';
import SupplyChainDashboard from './pages/SupplyChainDashboard';
import FederationDashboard from './pages/FederationDashboard';

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
          <Route path="health" element={<HealthMonitor />} />
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
          <Route path="mission-architect" element={<MissionArchitect />} />
          <Route path="chaos" element={<ChaosCommand />} />
          <Route path="policy-guard" element={<PolicyGuard />} />
          <Route path="terminal" element={<QuantumTerminal />} />
          <Route path="traffic" element={<TrafficController />} />
          <Route path="continuity" element={<MissionContinuity />} />
          <Route path="finops" element={<FinOpsBroker />} />
          <Route path="neural-id" element={<NeuralIdentity />} />
          <Route path="predictor" element={<QuantumPredictor />} />
          <Route path="forge" element={<MissionForge />} />
          <Route path="defense" element={<ActiveDefense />} />
          <Route path="knowledge" element={<KnowledgeMesh />} />
          <Route path="immersive" element={<ImmersiveOps />} />
          <Route path="evolution" element={<SelfEvolvingEngine />} />
          <Route path="war-room" element={<StrategicWarRoom />} />
          <Route path="briefing" element={<CommanderBriefing />} />
          <Route path="quantum-shield" element={<QuantumShield />} />
          <Route path="galactic-mesh" element={<GalacticMesh />} />
          <Route path="temporal" element={<TemporalCommand />} />
          <Route path="advisor" element={<NeuralAdvisor />} />
          <Route path="post-mortems" element={<PostMortems />} />
          <Route path="auction" element={<ResourceAuction />} />
          <Route path="registry" element={<UniversalRegistry />} />
          <Route path="threats" element={<ThreatHunting />} />
          <Route path="quantum-bridge" element={<QuantumBridge />} />
          <Route path="macro-forge" element={<MacroForge />} />
          <Route path="biolink" element={<NeuralBioLink />} />
          <Route path="space-mesh" element={<SpaceMesh />} />
          <Route path="sentient-healing" element={<SentientHealing />} />
          <Route path="data-singularity" element={<DataSingularity />} />
          <Route path="economy" element={<EconomicEmpire />} />
          <Route path="galactic-governance" element={<GalacticGovernance />} />
          <Route path="multiversal" element={<MultiVersalRedundancy />} />
          <Route path="iam" element={<IAMDashboard />} />
          <Route path="tenants" element={<TenantsDashboard />} />
          <Route path="terraform-enterprise" element={<TerraformEnterprise />} />
          <Route path="secrets-vault" element={<SecretsVault />} />
          <Route path="k8s-control" element={<K8sControlCenter />} />
          <Route path="cloud-governance" element={<CloudGovernance />} />
          <Route path="finops-center" element={<FinOpsCenter />} />
          <Route path="observability-center" element={<ObservabilityCenter />} />
          <Route path="aiops-center" element={<AIOpsCenter />} />
          <Route path="security-posture" element={<SecurityPosture />} />
          <Route path="event-fabric" element={<EventDashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="ai-agents" element={<AIAgentSwarm />} />
          <Route path="billing" element={<CustomerPortal />} />
          <Route path="msp-dashboard" element={<MSPDashboard />} />
          <Route path="security/soc" element={<SOCDashboard />} />
          <Route path="security/vault-compliance" element={<VaultAndCompliance />} />
          <Route path="security/fabric" element={<SecurityFabricDashboard />} />
          <Route path="security/event-fabric" element={<EventSecurityDashboard />} />
          <Route path="security/supply-chain" element={<SupplyChainDashboard />} />
          <Route path="security/federation" element={<FederationDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
