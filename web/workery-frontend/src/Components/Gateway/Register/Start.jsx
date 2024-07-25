import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

function RegisterStart() {
  return (
    <>
      <div className="column is-12 container">
        <div className="section">
          <section className="hero is-fullheight">
            <div class="hero-body">
              <div class="container">
                <div class="columns is-centered">
                  <div class="column is-half">
                    <h1 className="title is-3 has-text-centered">
                      What are you signing up as?
                    </h1>
                  </div>
                </div>
                <div class="columns is-centered">
                  <div class="column is-one-quarter-tablet">
                    <div class="card">
                      <div class="card-image">
                        <figure class="image is-4by3">
                          <img
                            src="https://bulma.io/images/placeholders/1280x960.png"
                            alt="Placeholder image"
                          />
                        </figure>
                      </div>
                      <div class="card-content">
                        <p class="title is-4">Job Seeker</p>

                        <div class="content">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                          <a href="#">#css</a> <a href="#">#responsive</a>
                          <br />
                        </div>
                      </div>
                      <footer class="card-footer">
                        <Link
                          class="button is-large is-primary card-footer-item"
                          to="/register/job-seeker/step-1"
                        >
                          Next&nbsp;
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      </footer>
                    </div>
                  </div>
                  <div class="column is-one-quarter-tablet">
                    <div class="card">
                      <div class="card-image">
                        <figure class="image is-4by3">
                          <img
                            src="https://bulma.io/images/placeholders/1280x960.png"
                            alt="Placeholder image"
                          />
                        </figure>
                      </div>
                      <div class="card-content">
                        <p class="title is-4">Employer</p>
                        <div class="content">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                          <a href="#">#css</a> <a href="#">#responsive</a>
                          <br />
                        </div>
                      </div>
                      <footer class="card-footer">
                        <Link
                          class="button is-large is-primary card-footer-item"
                          to="/register/employer/step-1"
                        >
                          Next&nbsp;
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      </footer>
                    </div>
                  </div>
                </div>
                <div class="columns is-centered">
                  <div class="column">
                    <p className="is-size-7-tablet has-text-centered">
                      Already have an account? <Link to="/login">Sign in</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default RegisterStart;
