import React, { useEffect, useState } from "react";
import "./Footer.css";
import { FaGem } from "react-icons/fa";
import { MDBFooter, MDBContainer, MDBRow, MDBCol } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import { userData } from "../../Services/Apis";

export default function Footer() {
  const [data, setData] = useState({});
  const userToken = sessionStorage.getItem("userdbtoken");
  const isLoggedIn = sessionStorage.getItem("loggedIn");

  const handleLogoutClick = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getUserData = await userData({ token: userToken });
        if (getUserData.status === 200) {
          // Set the fetched user data to the component state
          setData(getUserData.data.data);
          //console.log("User data is: ", data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Check if the user is logged in before making the API call
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, userToken]);

  return (
    <MDBFooter className="text-center text-lg-start text-muted footer-style">
      <section className="footer-section-style container">
        <MDBContainer className="text-center text-md-start mt-5">
          <MDBRow className="mt-3">
            <MDBCol md="3" lg="4" xl="3" className="mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <FaGem icon="gem" className="me-3" />
                VIT-Cafeteria
              </h6>
              <p>
                Simplifying VIT student's life by providing a platform for food
                ordering and delivery. The prices are up to date and are
                provided directly from the vendors themselves.
              </p>
            </MDBCol>

            <MDBCol md="3" lg="2" xl="2" className="mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Quick links</h6>
              <p>
                <Link to="/" className="text-reset">
                  Home
                </Link>
              </p>
              {isLoggedIn ? (
                data.isAdmin ? (
                  <>
                    <p>
                      <Link to="/users" className="text-reset">
                        Users
                      </Link>
                    </p>
                    <p>
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleLogoutClick}
                      >
                        Logout
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <Link to="/contact" className="text-reset">
                        Contact Us
                      </Link>
                    </p>
                    <p>
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleLogoutClick}
                      >
                        Logout
                      </button>
                    </p>
                  </>
                )
              ) : (
                <p>
                  <Link to="/login">
                    <button className="btn btn-outline-light">Login</button>
                  </Link>
                </p>
              )}
            </MDBCol>

            <MDBCol md="4" lg="3" xl="3" className="mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">About Us</h6>
              <p>
                <Link
                  to="https://www.linkedin.com/in/vaibhav-banka-828481220/"
                  target="_blank"
                  className="text-reset"
                >
                  Vaibhav Banka
                </Link>
              </p>
              <p>
                <Link
                  to="https://www.linkedin.com/in/harsh-jaiswal-365118239"
                  target="_blank"
                  className="text-reset"
                >
                  Harsh Jaiswal
                </Link>
              </p>
              <p>
                <Link
                  to="https://www.linkedin.com/in/aryan-raj-555768252/"
                  target="_blank"
                  className="text-reset"
                >
                  Vikram Singh
                </Link>
              </p>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      <div className="text-center p-4" style={{ backgroundColor: "#7C007C" }}>
        © {new Date().getFullYear()} Copyright:&nbsp;
        <Link className="text-reset fw-bold" to="/">
          VIT-Cafeteria
        </Link>
      </div>
    </MDBFooter>
  );
}
