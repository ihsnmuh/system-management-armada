import ContainerVehicleList from './containers/VehicleList';
import TopContainer from './containers/TopContainer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopContainer />
      <ContainerVehicleList />
    </div>
  );
}
