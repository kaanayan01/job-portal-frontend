export default function AdminHeader(){
    return (
      <header className="page-header py-3 bg-white border-bottom">
        <div className="container-lg d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0">Admin Dashboard</h2>
            <small className="text-muted">Overview & quick actions</small>
          </div>
          <div>
            <button className="btn btn-outline-secondary me-2">Reports</button>
            <button className="btn btn-primary">Create User</button>
          </div>
        </div>
      </header>
    );
  }