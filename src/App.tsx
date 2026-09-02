import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { UiProvider } from './store/UiContext';
import { FiltersProvider } from './store/FiltersContext';
import { ToastProvider } from './store/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { HQPage } from './pages/HQPage';
import { PersonalPage } from './pages/PersonalPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { MissionDetailPage } from './pages/MissionDetailPage';
import { MovementPlanningPage } from './pages/MovementPlanningPage';
import { EventsPage } from './pages/EventsPage';
import { SituationAssessmentPage } from './pages/SituationAssessmentPage';
import { DirectivesListPage } from './pages/DirectivesListPage';
import { DirectiveDetailPage } from './pages/DirectiveDetailPage';
import { DirectiveFormPage } from './pages/DirectiveFormPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ReasoningMapPage } from './pages/ReasoningMapPage';
import { EventContextPage } from './pages/EventContextPage';
import { SourcesPage } from './pages/SourcesPage';
import { TrustPage } from './pages/TrustPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { TimelinePage } from './pages/TimelinePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <StoreProvider>
      <UiProvider>
        <FiltersProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/me" replace />} />
                <Route path="/brief" element={<Navigate to="/me" replace />} />
                <Route path="/attention" element={<Navigate to="/me" replace />} />
                <Route path="/hq" element={<HQPage />} />
                <Route path="/hq/timeline" element={<TimelinePage />} />
                <Route path="/me" element={<PersonalPage />} />
                <Route path="/situation-assessment" element={<SituationAssessmentPage />} />
                <Route path="/situation-assessment/:sessionId" element={<Navigate to="/situation-assessment" replace />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:missionId" element={<MissionDetailPage />} />
                <Route path="/planning/:opId/movement" element={<MovementPlanningPage />} />
                <Route path="/directives" element={<DirectivesListPage />} />
                <Route path="/directives/new" element={<DirectiveFormPage />} />
                <Route path="/directives/:directiveId" element={<DirectiveDetailPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                {/* Event entities open in the focused Event Context (Control proof); other entity
                    types keep the reasoning map. Same /entity/... URL scheme — no new route concept. */}
                <Route path="/entity/event/:entityId" element={<EventContextPage />} />
                <Route path="/entity/:entityType/:entityId" element={<ReasoningMapPage />} />
                {/* Widget library merged into Situation Assessment — keep routes as redirects for old links */}
                <Route path="/widgets" element={<Navigate to="/situation-assessment" replace />} />
                <Route path="/widgets/:widgetId" element={<Navigate to="/situation-assessment" replace />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/trust" element={<TrustPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/me" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
        </FiltersProvider>
      </UiProvider>
    </StoreProvider>
  );
}

export default App;
