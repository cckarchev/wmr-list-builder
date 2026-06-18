import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../store/useArmyStore';
import RosterUnit from '../components/army/RosterUnit';
import ArmyUnitRow from '../components/army/ArmyUnitRow';
import PointsBar from '../components/army/PointsBar';
import CopyListButton from '../components/army/CopyListButton';
import Button from '../components/ui/Button';
import ErrorList from '../components/ui/ErrorList';

const Page = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => `${theme.space[5]}px`};
  padding: ${({ theme }) => `${theme.space[4]}px`};

  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const SectionHeading = styled.h2`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  padding-bottom: ${({ theme }) => `${theme.space[2]}px`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const ArmyName = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.color.accent};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const EmptyArmy = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.dim};
  font-style: italic;
`;

const ErrorSection = styled.div`
  padding: ${({ theme }) => `0 ${theme.space[4]}px ${theme.space[4]}px`};
`;

export default function Build() {
  const { armyId } = useParams<{ armyId: string }>();

  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const setArmy = useArmyStore((s) => s.setArmy);

  useEffect(() => {
    if (armyId) {
      setArmy(armyId);
    }
  }, [armyId, setArmy]);

  if (!army) return null;

  const allUnitIds = Object.keys(units);
  const usedUnitIds = allUnitIds.filter((id) => units[id].number > 0);

  return (
    <Page>
      <PointsBar />
      <Toolbar className="no-print">
        <CopyListButton />
        <Button as={Link} to={`/print/${armyId}`} $variant="primary">
          Print
        </Button>
      </Toolbar>
      <ArmyName>{army.name}</ArmyName>
      <Grid>
        <Section aria-label="Roster">
          <SectionHeading>Roster</SectionHeading>
          {allUnitIds.map((id) => (
            <RosterUnit key={id} unitId={id} />
          ))}
        </Section>
        <Section aria-label="Your Army">
          <SectionHeading>Your Army</SectionHeading>
          {usedUnitIds.length === 0 ? (
            <EmptyArmy>No units selected yet. Add units from the Roster.</EmptyArmy>
          ) : (
            usedUnitIds.map((id) => (
              <ArmyUnitRow key={id} unitId={id} />
            ))
          )}
        </Section>
      </Grid>
      {errors.length > 0 && (
        <ErrorSection>
          <ErrorList errors={errors} />
        </ErrorSection>
      )}
    </Page>
  );
}
