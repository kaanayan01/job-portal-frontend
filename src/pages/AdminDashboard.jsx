
import React, { useEffect, useState } from "react";
import "../App.css";
import { apiFetch, getToken} from "../api";
import { useNavigate } from "react-router-dom";
function AdminDashboard({setCurrentPage, setCurrentEmployer}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const gotoCompanyDetailPage = () => setCurrentPage("companyDetail");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token= getToken();
      const response = await apiFetch(`/api/employers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },

      });

      if (response.status !== "success" && response.status !== 200) {
        console.log(response.message || "Invalid login");
        return;
      }
  if(response.status === 200){
    const json = await response.json();
    //console.log('--------------------------');
    //console.log(json.data);
    setEmployees(json.data);
  }

     
      console.log(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  const handleRowClick = (emp) => {
   gotoCompanyDetailPage();
   //console.log('employer id = '+ emp);
   setCurrentEmployer(emp);
  };
 
return (
  
  <div className="main-container">
    <h2>Admin Dashboard</h2>

    {/* Metrics Section */}
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-label">Total Users</div>
        <div className="metric-value">120</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Active Employers</div>
        <div className="metric-value">18</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Jobs Posted</div>
        <div className="metric-value">54</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Payments (₹)</div>
        <div className="metric-value">75K</div>
      </div>
    </div>

    {/* Employees List Section */}
    <div className="section" style={{ marginTop: "30px" }}>
      <h3>Employees List</h3>
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Number</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(employees) && employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}
                onClick={() => handleRowClick(emp)}
                    style={{ cursor: "pointer" }}
                >
                  <td style={{ padding: "8px" }}>{emp.employerId}</td>
                                     <td style={{ padding: "8px" }}>{emp.contactEmail}</td>
                  <td style={{ padding: "8px" }}>{emp.contactNumber}</td>
                  <td style={{ padding: "8px" }}>{emp.approvalStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "8px" }}>
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

}

export default AdminDashboard;
